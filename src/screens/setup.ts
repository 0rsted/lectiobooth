import { clearChildren } from '../functions/clearChildren'
import { getAllSchools } from '../functions/getAllSchools';
import { Configuration, ButtonEnum, buttonAlias } from '../functions/config';
import { changePage } from '../functions/changePage';
import { getCameraData } from '../functions/getCameraData';
import { Pages } from '.';
import { AddKey, RemoveKey } from '../functions/keyHandler';
import {
  InputType,
  label,
  LabelInput,
  table,
} from '../components'

export const id = 'setup'

const filledClass = "filled"

export const renderer = () => {
  const config = new Configuration()

  // create components

  const header = document.createElement('h1')
  header.textContent = 'Velkommen til lectiobooth'

  const description = document.createElement('p')
  description.textContent = `Her skal du sætte de grundlæggende indstillinger for programmet.\nNår du har gemt indstillingerne og klikket "næste" vil programmet automatisk starte i "scan" mode.\nFor at komme tilbage til opsætningen kan du enten trykke ALT+F12 for at nulstille alt, eller trykke CTRL+F12 for at gå til opsætningen uden at nulstille noget.\nDet anbefales at brugerne maksimalt har adgang til en numerisk blok, eller alternativt en blok med farvede knapper som vil sende tal til systemet.\nBruger du farvede knapper bør du ændre indstilligerne under "Knap 0"-"Knap 9".`

  //#region schoolDropdown
  // select school

  const schoolDropdownLabel = label('schoolDropdown', 'Vælg skole')
  const schoolDropdown = document.createElement('select')
  schoolDropdown.disabled = true
  schoolDropdown.name = schoolDropdownLabel.getAttribute('for')
  schoolDropdown.id = schoolDropdownLabel.getAttribute('for')
  schoolDropdown.addEventListener('change', (e: any) => {
    config.schoolId = e.target.value
    config.schoolName = e.target.options[e.target.selectedIndex].textContent
  })

  const loadingOption = document.createElement('option')
  loadingOption.textContent = 'Indlæser skoler, vent venligst'
  loadingOption.value = '-1'
  loadingOption.disabled = true
  schoolDropdown.appendChild(loadingOption)
  //#endregion

  //#region userName
  // api userName
  const userName = LabelInput('userInput', 'Api Brugernavn', config.apiUser, (e: any) => config.apiUser = e.target.value)
  //#endregion

  //#region userPassword
  // api userPassword
  const userPassword = LabelInput('userPassword', 'Api Adgangskode', config.apiPass, (e: any) => config.apiPass = e.target.value, InputType.PASSWORD)
  //#endregion

  //#region testConnection
  const testConnectionLabel = label('testConnection', '\u00A0')
  const testConnectionWrapper = document.createElement('slot')
  const testConnectionButton = document.createElement('button')
  testConnectionButton.name = testConnectionLabel.getAttribute('for')
  testConnectionButton.id = testConnectionLabel.getAttribute('for')
  testConnectionButton.textContent = 'Test forbindelse'
  const testConnectionResult = document.createElement('span')
  testConnectionResult.className = 'connectionTest'
  testConnectionResult.textContent = ' <- klik her for at verificere at koden virker'
  testConnectionWrapper.append(testConnectionButton, testConnectionResult)
  //#endregion

  //#region warningText
  // warning text for students
  const warningTextLabel = label('warningText', 'Infotekst til brugere')
  const warningText = document.createElement('textarea')
  warningText.id = warningTextLabel.getAttribute('for')
  warningText.name = warningTextLabel.getAttribute('for')
  warningText.textContent = config.infoText
  warningText.autocomplete = 'off'
  // @ts-expect-error : ts doesn't know autocorrect
  warningText.autocorrect = 'off'
  warningText.spellcheck = false
  warningText.style.resize = 'both'
  warningText.addEventListener('change', (e: any) => {
    config.infoText = e.target.value
  })
  //#endregion

  //#region allowRetake
  // @ts-expect-error: typescript and events
  const allowRetake = LabelInput('allowRetake', 'Tillad eksisterende\u000D\u000A at tage et nyt billede', config.allowRetake.toString(), (e) => { config.allowRetake = e.target.checked }, InputType.CHECKBOX)
  //#endregion

  //#region numImages
  const numImages = LabelInput(
    'numImages',
    `Antal billeder der må tages og vælges imellem\n(maximalt 6)`,
    config.numImages,
    (e) => {
      // @ts-expect-error: typescript and events
      const val = parseInt(e.target.value)
      if(!isNaN(val)) {
        if(val > 0 && val < 7)
          config.numImages = val
      }
    },
    InputType.NUMBER
  )
  //#endregion

  //#region buttonNames
  const updateButtonText = (button: ButtonEnum, alias: string) => {
    const updater: buttonAlias = {}
    updater[button] = alias
    config.buttonAlias = updater
  }

  const buttonAlias: HTMLElement[][] = []
  for (const enumName in ButtonEnum) {
    // @ts-expect-error: I'm doing magic
    const buttonName = ButtonEnum[enumName]
    const button = LabelInput(
      `button${buttonName}`,
      `Knap ${buttonName}`,
      (config.buttonAlias && config.buttonAlias[buttonName as ButtonEnum]) ?
        config.buttonAlias[buttonName as ButtonEnum] :
        "",
      (e: any) => updateButtonText((buttonName.toString() as ButtonEnum), e.target.value),
      InputType.TEXT,
      `tasten ${buttonName}`
    )
    window.dispatchEvent(AddKey(`Button${buttonName}`, {
      key: buttonName.toString(),
      fnc: () => {
        const elm = button[0].parentElement.parentElement
        elm.style.backgroundColor = window.getComputedStyle(document.documentElement)?.getPropertyValue("background-color")
        elm.style.filter = "invert(1)"
        window.setTimeout(() => { elm.style.removeProperty('background-color'); elm.style.removeProperty('filter') }, 2500)
      }
    }))
    buttonAlias.push(button)
  }
  //#endregion

  //#region color
  // @ts-expect-error: typescript and events
  const primaryColor = LabelInput('primaryColor', 'Vælg skolens primære farve', config.schoolPrimaryColor, (e) => { config.schoolPrimaryColor = e.target.value }, InputType.COLOR)
  // @ts-expect-error: typescript and events
  const secondaryColor = LabelInput('secondaryColor', 'Vælg skolens sekundære farve', config.schoolSecondaryColor, (e) => { config.schoolSecondaryColor = e.target.value }, InputType.COLOR)
  //#endregion

  //#region chooseCamera
  const chooseCameraLabel = document.createElement('span')
  chooseCameraLabel.textContent = 'Vælg kamera'
  const chooseCameraWrapper = document.createElement('slot')
  const chooseCameraButton = document.createElement('button')
  // @ts-expect-error: typescript doesn't understand events
  chooseCameraButton.addEventListener('click', (e) => { loadCameras(e.target.parentElement, config) })
  chooseCameraButton.textContent = 'Klik for at indlæse kameraer'
  chooseCameraWrapper.appendChild(chooseCameraButton)
  const resolutionText = document.createElement('p')
  resolutionText.innerText = `Lectio skalerer billedet til 180×240 (B×H)\nBilledet bliver taget i den højeste opløsning\nog beskåret det så det passer`
  //#endregion

  //#region nextPage
  const nextPage = document.createElement('button')
  nextPage.textContent = 'Næste side'
  nextPage.onclick = () => {
    
    window.dispatchEvent(changePage(Pages.SCAN))
  }
  //#endregion

  //#region render
  document.body
    .append(
      header,
      description,
      table([
        [schoolDropdownLabel, schoolDropdown],
        userName,
        userPassword,
        [testConnectionLabel, testConnectionWrapper],
        [undefined, undefined],
        [warningTextLabel, warningText],
        allowRetake,
        numImages,
        [undefined, undefined],
        ...buttonAlias,
        [undefined, undefined],
        primaryColor,
        secondaryColor,
        [undefined, undefined],
        [chooseCameraLabel, chooseCameraWrapper],
        [resolutionText],
        [undefined, nextPage]
      ]))
  //#endregion

  //#region effects
  // effects should always run after render
  const updateLabels = () => {
    for (const elm of document.getElementsByClassName(filledClass)) {
      elm.classList.remove(filledClass)
    }
    testConnectionButton.disabled = ((config.schoolId === -1) && (config.apiUser === '') && (config.apiPass === ''))
    nextPage.disabled = !(config.isFilled && testConnectionResult.classList.contains('success'))
    if (config.schoolId !== -1) {
      schoolDropdownLabel.classList.add(filledClass)
    } else {
      schoolDropdown.selectedIndex = 0
    }

    if (config.apiUser !== "") {
      if (!userName[0].classList.contains(filledClass))
        userName[0].classList.add(filledClass)
    } else {
      userName[0].classList.remove(filledClass)
      userName[1].value = ""
    }

    if (config.apiPass !== "") {
      if (!userPassword[0].classList.contains(filledClass))
        userPassword[0].classList.add(filledClass)
    } else {
      userPassword[0].classList.remove(filledClass)
      userPassword[1].value = ""
    }

    if (config.infoText && config.infoText !== "") {
      if (!warningTextLabel.classList.contains(filledClass))
        warningTextLabel.classList.add(filledClass)
    } else {
      warningTextLabel.classList.remove(filledClass)
      warningText.textContent = ""
    }

    if (config.camera && config.camera !== "") {
      const chosenCameraId = document.getElementById('chosenCamera') || document.createElement('span')
      chosenCameraId.id = 'chosenCamera'
      chooseCameraLabel.classList.add(filledClass)
      chosenCameraId.className = 'blockSpan hideOverflow chosenCameraId'
      chosenCameraId.textContent = `Kamera valgt (${config.camera})\r\n`
      chooseCameraWrapper.prepend(chosenCameraId)
    } else {
      chooseCameraWrapper.childNodes.forEach(child => {
        // @ts-expect-error: TS doesn't think a child has a classList
        if (child.classList.contains('chosenCameraId'))
          chooseCameraWrapper.removeChild(child)
      })
    }

    allowRetake[0].classList.add(filledClass)
    primaryColor[0].classList.add(filledClass)
    secondaryColor[0].classList.add(filledClass)

  }
  window.addEventListener('configUpdated', updateLabels)

  const testConnectionAsync = async () => {
    testConnectionResult.classList.add('running')
    testConnectionResult.textContent = ''
    try {
      // @ts-expect-error: electron isn't fully typed
      const response = await window.lectioApi.SayHelloAsync(config.getConfig)
      console.log(response[0].SayHelloResult)
      testConnectionResult.classList.remove('running')
      testConnectionResult.classList.add('success')
      testConnectionLabel.classList.add(filledClass)
      updateLabels()
    } catch (e) {
      console.warn(e)
      testConnectionResult.classList.remove('running')
      testConnectionResult.classList.add('fail')
      testConnectionResult.textContent = e.message
      updateLabels()
    }
  }
  testConnectionButton.addEventListener('click', testConnectionAsync)

  const addSchoolsAsync = async (parentElement: HTMLSelectElement) => {
    const schools = await getAllSchools()
    clearChildren(parentElement)
    parentElement.disabled = false
    const thisOption = document.createElement('option')
    thisOption.value = "-1"
    thisOption.selected = config.schoolId === -1
    thisOption.textContent = "Vælg en skole"
    parentElement.appendChild(thisOption)
    for (const school of schools) {
      const thisOption = document.createElement('option')
      thisOption.value = school.id
      if (school.id === config.schoolId)
        thisOption.selected = true
      thisOption.textContent = school.name
      parentElement.appendChild(thisOption)
    }
  }

  const loadCameras = async (containerElement: HTMLElement) => {
    clearChildren(containerElement)
    containerElement.textContent = 'Finder kameraer'
    const cameras = await getCameraData()
    if (cameras && cameras.length) {
      clearChildren(containerElement)
      const choose = document.createElement('span')
      choose.className = 'blockSpan'
      choose.textContent = 'Vælg et kamera'
      containerElement.appendChild(choose)
      for (const camera of cameras) {
        const cameraSelector = document.createElement('span')
        cameraSelector.textContent = camera.label
        cameraSelector.className = 'clickSpan'
        cameraSelector.addEventListener('click', (e) => {
          config.camera = camera.deviceId
          // @ts-expect-error: typescript doesn't understand events
          e.target.parentElement.childNodes.forEach(element => {
            element.classList?.remove('selected')
          });
          // @ts-expect-error: typescript doesn't understand events
          e.currentTarget.classList.add('selected')
        })
        containerElement.appendChild(cameraSelector)
      }
    } else {
      containerElement.textContent = 'Kan ikke finde nogle kameraer'
    }
  }

  updateLabels()
  addSchoolsAsync(schoolDropdown)
  //#endregion
}

export const unRender = () => {
  for (let i = 0; i < 10; i++) {
    window.dispatchEvent(RemoveKey(`Button${i}`))
  }
}