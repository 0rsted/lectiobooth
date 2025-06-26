import { resolutionDefinition } from "../assets/resolutions";
import { cameraData } from "./getCameraData";
import { setItem } from "./storage";

export const selectCamera = (camera: cameraData, resolution: resolutionDefinition) => {
    setItem("deviceId", camera.deviceId)
    setItem('resolution', JSON.stringify(resolution))
}