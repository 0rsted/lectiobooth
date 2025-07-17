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
  deviceResolution?: {
    width: number;
    height?: number;
    name?: string;
  } | {
    width?: number;
    height: number;
    name?: string;
  };
  infoText?: string;
  isFilled?: boolean;
  allowRetake: boolean;
  userCpr?: string;
}

const defaultConfig: expectedConfig = {
  schoolId: -1,
  apiUser: "",
  apiPass: "",
  allowRetake: false,
}

export class Configuration {
  private current: expectedConfig = Object.assign({}, defaultConfig)
  private previous: expectedConfig = Object.assign({}, defaultConfig)

  constructor() {
    this.load()
    window.addEventListener("configUpdated", function () { console.log('configUpdated, load'); this.load() }.bind(this))
    window.addEventListener("storageUpdated", function () {
      window.dispatchEvent(new CustomEvent("configUpdated", { detail: 'storageUpdated, loading config' }))
    }.bind(this))
  }

  private save = (): void => {
    setItem(savedConfig, JSON.stringify(this.current))
    window.dispatchEvent(new CustomEvent("configUpdated", { detail: { current: this.current, previous: this.previous } }))
    this.previous = this.current
  }

  private load = (): void => {
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

  public reset(): void {
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

  public set allowRetake(allowRetake: boolean) {
    this.current.allowRetake = allowRetake
    this.save()
  }

  public get allowRetake() { return this.current.allowRetake }

  public set userCpr(userCpr: string) {
    this.current.userCpr = userCpr
    this.save()
  }

  public get userCpr() { return this.current.userCpr }

  public clearUserCpr(): void { delete this.current.userCpr }

  public get isFilled(): expectedConfig['isFilled'] {
    return (
      (this.current.schoolId !== -1) && 
      (this.current.apiUser !== '') &&
      (this.current.apiPass !== '') && 
      (this.current.deviceId && this.current.deviceId !== '') && 
      (this.current.infoText && this.current.infoText !== '') && 
      (!!this.current.deviceResolution.height || !!this.current.deviceResolution.height))
  }
}