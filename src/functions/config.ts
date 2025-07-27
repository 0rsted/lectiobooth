import { setItem, getItem } from "./storage"

const savedConfig = 'config'

//#region types and enums

export enum ButtonEnum {
  KEY_0 = '0',
  KEY_1 = '1',
  KEY_2 = '2',
  KEY_3 = '3',
  KEY_4 = '4',
  KEY_5 = '5',
  KEY_6 = '6',
  KEY_7 = '7',
  KEY_8 = '8',
  KEY_9 = '9',
}

export type buttonAlias = {
  [key in ButtonEnum]?: string
}

export type expectedConfig = {
  allowRetake: boolean;
  apiPass: string;
  apiUser: string;
  buttonAlias?: buttonAlias
  deviceId?: string;
  infoText?: string;
  isFilled?: boolean; // function 
  numImages: number;
  schoolId: number;
  schoolName?: string;
  schoolPrimaryColor: string;
  schoolSecondaryColor: string;
  userCpr?: string;
}

//#endregion

const defaultConfig: expectedConfig = {
  allowRetake: false,
  apiPass: "",
  apiUser: "",
  infoText: undefined,
  numImages: 4,
  schoolId: -1,
  schoolPrimaryColor: "#FFFFFF",
  schoolSecondaryColor: "#FF0000",
}

export class Configuration {
  private current: expectedConfig = Object.assign({}, defaultConfig)
  private previous: expectedConfig = Object.assign({}, defaultConfig)

  constructor() {
    this.load()
    window.addEventListener("configUpdated", function () { console.log('configUpdated, load'); this.load() }.bind(this))
  }

  //#region internal functions
  private save = (dispatchEvent = true): void => {
    setItem(savedConfig, JSON.stringify(this.current))
    dispatchEvent && window.dispatchEvent(new CustomEvent("configUpdated", { detail: { current: this.current, previous: this.previous } }))
    this.previous = this.current
  }

  private load = (): void => {
    try {
      const tempVal = getItem(savedConfig)
      if (tempVal) {
        const parsed = JSON.parse(tempVal)
        if (parsed) {
          this.current = Object.assign({}, defaultConfig, parsed)
        }
      }
    } catch { /* this block intentionally left empty */ }
  }

  public reset(): void {
    this.current = {} as unknown as expectedConfig
    this.current = Object.assign({}, defaultConfig)
    this.save()
  }
  //#endregion

  //#region external magic functions

  public get getConfig() { return this.current }

  public get isFilled(): expectedConfig['isFilled'] {
    return (
      (this.current.schoolId !== -1) &&
      (this.current.apiUser !== '') &&
      (this.current.apiPass !== '') &&
      (this.current.deviceId && this.current.deviceId !== '') &&
      (this.current.infoText && this.current.infoText !== ''))
  }

  //#endregion

  //#region getters and setters
  public set allowRetake(allowRetake: expectedConfig["allowRetake"]) {
    this.current.allowRetake = allowRetake
    this.save()
  }
  public get allowRetake() { return this.current.allowRetake }

  public set apiPass(apiPass: expectedConfig["apiPass"]) {
    this.current.apiPass = apiPass
    this.save()
  }
  public get apiPass() { return this.current.apiPass }

  public set apiUser(apiUser: expectedConfig["apiUser"]) {
    this.current.apiUser = apiUser
    this.save()
  }
  public get apiUser() { return this.current.apiUser }

  public set buttonAlias(button: expectedConfig["buttonAlias"]) {
    const currentAlias = this.current.buttonAlias ?? {} as buttonAlias
    Object.assign(currentAlias, button)
    for (const key in currentAlias) {
      if (currentAlias[key as ButtonEnum] === "") {
        delete currentAlias[key as ButtonEnum]
      }
    }
    this.current.buttonAlias = currentAlias
    this.save()
  }
  public get buttonAlias() {
    const alias: buttonAlias = {}
    for (const enumName in ButtonEnum) {
      // @ts-expect-error: I'm doing magic
      const buttonName = ButtonEnum[enumName]
      alias[buttonName as ButtonEnum] = `tasten ${buttonName}`
    }
    return Object.assign({}, alias, this.current.buttonAlias ?? {} as buttonAlias)
  }

  public set infoText(infoText: expectedConfig["infoText"]) {
    this.current.infoText = infoText
    this.save()
  }
  public get infoText() { return this.current.infoText }

  public set camera(deviceId: expectedConfig["deviceId"]) {
    this.current.deviceId = deviceId
    this.save()
  }
  public get camera() { return this.current.deviceId }

  public set numImages(numImages: expectedConfig['numImages']) {
    if(isNaN(numImages) && isNaN(parseInt(`${numImages}`)))
      throw new TypeError("This is supposed to be a NUMBER")
    this.current.numImages = (typeof numImages === 'string') ? parseInt(numImages) : numImages
    this.save()
  }
  public get numImages() { return this.current.numImages }

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

  public set schoolPrimaryColor(schoolPrimaryColor: expectedConfig["schoolPrimaryColor"]) {
    this.current.schoolPrimaryColor = schoolPrimaryColor
    this.save()
  }
  public get schoolPrimaryColor() { return this.current.schoolPrimaryColor }

  public set schoolSecondaryColor(schoolSecondaryColor: expectedConfig["schoolSecondaryColor"]) {
    this.current.schoolSecondaryColor = schoolSecondaryColor
    this.save()
  }
  public get schoolSecondaryColor() { return this.current.schoolSecondaryColor }

  public set userCpr(userCpr: expectedConfig["userCpr"]) {
    this.current.userCpr = userCpr
    this.save(false)
  }
  public get userCpr() { return this.current.userCpr }
  public clearUserCpr(): void {
    if (!this.current.userCpr)
      return
    delete this.current.userCpr
    this.save()
  }
  //#endregion
}