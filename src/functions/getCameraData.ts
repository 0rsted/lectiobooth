import { allResolutions, type resolutionDefinition } from "../assets/resolutions"

export type cameraData = {
  deviceId: string
  label: string
  height: {
    max?: number
    min?: number
  }
  width: {
    max?: number
    min?: number
  },
  possibleResolutions?: resolutionDefinition[]
  verifiedResolutions?: resolutionDefinition[]
}

export const getCameraData = async (): Promise<cameraData[]> => {
  const cameras: cameraData[] = []
  try {
    navigator.mediaDevices.getUserMedia({ video: true })
    const devices = await navigator.mediaDevices.enumerateDevices()
    for (const device of devices) {
      if (device.kind === 'videoinput') {
        // @ts-expect-error: typescript doesn't know that a device should have getCapabilities
        const { width, height } = device.getCapabilities() as MediaTrackCapabilities
        const possibleResolutions = allResolutions.filter(resolution => (resolution.height <= height.max && resolution.width <= width.max && resolution.height >= height.min && resolution.width >= width.min))
        const newDevice: cameraData = {
          deviceId: device.deviceId,
          label: device.label,
          height,
          width,
          possibleResolutions
        }
        cameras.push(newDevice)
      }
    }
  } catch { /* we'll ignore errors */ }
  return cameras
}

export const getSingleCameraData = async (cameraId: string) => ((await getCameraData()).find(c => c.deviceId === cameraId))

export const getConstraints = () => {
  return navigator.mediaDevices.getSupportedConstraints()
}

export const solveCameraResolutions = async (camera: cameraData): Promise<cameraData> => {
  const { possibleResolutions, deviceId } = camera
  camera.verifiedResolutions = []
  const baseConstraints = {
    audio: false,
    video: {
      deviceId,
      frameRate: { min: 1, max: 60 },
    }
  }
  const stream = await navigator.mediaDevices.getUserMedia(baseConstraints)
  const videoTracks = stream.getVideoTracks()
  let videoTrack
  if (videoTracks.length > 0) {
    videoTrack = videoTracks[0];
  }
  if (!videoTrack) return camera
  for (const { width, height } of possibleResolutions) {
    for (let frameRate = 1; frameRate <= 60; frameRate++) {
      try {
        await videoTrack.applyConstraints(Object.assign({ width, height, frameRate }, baseConstraints.video))
        const current = videoTrack.getSettings()
        if (current.frameRate > frameRate) {
          frameRate = current.frameRate - 1
          continue
        }
        if (current.width === width && current.height === height && current.frameRate === frameRate) {
          const name = allResolutions.find((res) => (res.height === height && res.width === width)).name || `${width} × ${height}` 
          camera.verifiedResolutions.push(Object.assign({name, height, width, frameRate}, current))
        }
      } catch {/* just go to the next option */ }
    }
  }
  if (camera.verifiedResolutions.length > 0)
    delete camera.possibleResolutions
  return camera
}
