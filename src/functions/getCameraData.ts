import { allResolutions, type resolutionDefinition } from "../assets/resolutions"

export type cameraData = {
  deviceId: string
  label: string
  height: {
    max: number
    min: number
  }
  width: {
    max: number
    min: number
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
        // @ts-expect-error : there is no definition of getCapabilities
        const { width, height } = device.getCapabilities()
        const possibleResolutions = allResolutions.filter(resolution => (resolution.height <= height.max && resolution.width <= width.max))
        const newDevice: cameraData = {
          deviceId: device.deviceId,
          label: device.label,
          height,
          width,
          possibleResolutions
        }
        cameras.push(await solveCameraResolutions(newDevice))
      }
    }
  } catch (e) { console.error(e) }
  return cameras
}

export const getConstraints = () => {
  return navigator.mediaDevices.getSupportedConstraints()
}

export const solveCameraResolutions = async (camera: cameraData): Promise<cameraData> => {
  const { possibleResolutions, deviceId } = camera
  camera.verifiedResolutions = []
  const baseConstraints = {
    audio: false,
    video: {
      deviceId
    }
  }
  const stream = await navigator.mediaDevices.getUserMedia(baseConstraints)
  const videoTracks = stream.getVideoTracks()
  let videoTrack
  if (videoTracks.length > 0) {
    videoTrack = videoTracks[0];
  }
  if(!videoTrack) return camera
  for(const resolution of possibleResolutions) {
    try {
      await videoTrack.applyConstraints(Object.assign({width: resolution.width}, baseConstraints.video))
      const current = videoTrack.getSettings()
      if(current.width === resolution.width && current.height === resolution.height)
        camera.verifiedResolutions.push(resolution)
    } catch {/* just go to the next option */}
  }
  if(camera.verifiedResolutions.length > 0)
    camera.possibleResolutions = undefined
  return camera
}
