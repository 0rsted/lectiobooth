import { setItem, getItem } from "./storage"

const savedConfig = 'config'

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

export type expectedConfig = {
  schoolId: number;
  schoolName?: string;
  apiUser: string;
  apiPass: string;
  deviceId?: string;
  deviceResolution: {
    width: number;
    height?: number;
  } | {
    width?: number;
    height: number;
  };
  infoText?: string;
}

const defaultConfig: expectedConfig = {
  schoolId: -1,
  apiUser: "",
  apiPass: "",
  deviceResolution: { width: 160 }
}

export class config {
  private current: expectedConfig = Object.assign({}, defaultConfig)

  constructor() {
    this.load()
  }

  private save = () => {
    setItem(savedConfig, JSON.stringify(this.current))
  }

  private load = () => {
    try {
      const tempVal = getItem(savedConfig)
      if (tempVal) {
        const parsed = JSON.parse(tempVal)
        if (parsed) {
          this.current = parsed
        }
      }
    } catch { }
  }

  public reset() {
    this.current = Object.assign({}, defaultConfig)
    this.save()
  }

  public get getConfig() { return this.current }

  public set schoolId(schoolId: expectedConfig["schoolId"]) {
    this.current.schoolId = schoolId
    this.save()
  }
  public get schoolId() { return this.current.schoolId }

  public set schoolName(schoolName: expectedConfig["schoolName"]) {
    this.current.schoolName = schoolName
    this.save()
  }
  public get schoolName() { return this.current.schoolName }

  public set apiUser(apiUser: expectedConfig["apiUser"]) {
    this.current.apiUser = apiUser
    this.save()
  }
  public get apiUser() { return this.current.apiUser }

  public set apiPass(apiPass: expectedConfig["apiPass"]) {
    this.current.apiPass = apiPass
    this.save()
  }
  public get apiPass() { return this.current.apiPass }

  public set camera(deviceId: expectedConfig["deviceId"]) {
    this.current.deviceId = deviceId
    this.save()
  }
  public get camera() { return this.current.deviceId }

  public set resolution(deviceResolution: expectedConfig["deviceResolution"]) {
    this.current.deviceResolution = deviceResolution
    this.save()
  }
  public get resolution() { return this.current.deviceResolution }

  public set infoText(infoText: expectedConfig["infoText"]) {
    this.current.infoText = infoText
    this.save()
  }
  public get infoText() { return this.current.infoText }

}