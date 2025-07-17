import { clearChildren } from '../functions/clearChildren'
import { getAllSchools } from '../functions/getAllSchools';
import { Configuration } from '../functions/config';
import { changePage } from '../functions/changePage';
import { cameraData, getCameraData, solveCameraResolutions } from '../functions/getCameraData';

import {
  label,
  table,
  textInput
} from '../components'

export const setupScreen = () => {
  setupElements()
}
export default setupScreen

const chooseResolutionField = document.createElement('span')
chooseResolutionField.className = 'blockSpan'
chooseResolutionField.textContent = 'vælg et kamera først'

const filledClass = "filled"

const setupElements = () => {
  const config = new Configuration()
  const body = document.body
  clearChildren(body, true)

  // create components

  const header = document.createElement('h1')
  header.textContent = 'Velkommen til lectiocam'

  const description = document.createElement('p')
  description.textContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\r\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\r\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\r\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

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

  // api userName
  const userInputLabel = label('userInput', 'Api Brugernavn')
  const userInput = textInput(userInputLabel.getAttribute('for'), config.apiUser, (e: any) => config.apiUser = e.target.value)

  // api userPassword
  const userPasswordLabel = label('userPassword', 'Api Adgangskode')
  const userPassword = textInput(userInputLabel.getAttribute('for'), config.apiPass, (e: any) => config.apiPass = e.target.value, true)

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

  const chooseCameraLabel = document.createElement('span')
  chooseCameraLabel.textContent = 'Vælg kamera'

  const chooseCameraWrapper = document.createElement('slot')
  const chooseCameraButton = document.createElement('button')
  // @ts-expect-error: typescript doesn't understand events
  chooseCameraButton.addEventListener('click', (e) => { loadCameras(e.target.parentElement, config) })
  chooseCameraButton.textContent = 'Klik for at indlæse kameraer'
  chooseCameraWrapper.appendChild(chooseCameraButton)

  const chooseResolutionLabel = document.createElement('span')
  chooseResolutionLabel.textContent = 'Vælg opløsning'

  const nextPage = document.createElement('button')
  nextPage.textContent = 'Næste side'
  nextPage.onclick = () => changePage('scan')

  const testConnectionWrapper = document.createElement('slot')
  const testConnectionButton = document.createElement('button')
  testConnectionButton.textContent = 'Test forbindelse'
  testConnectionWrapper.appendChild(testConnectionButton)
  const testConnectionResult = document.createElement('span')
  testConnectionResult.className = 'test'
  testConnectionResult.textContent = ' <- klik her for at verificere at koden virker'
  testConnectionWrapper.appendChild(testConnectionResult)

  const allowRetakeLabel = label('allowRetake', 'Tillad eksisterende at tage et nyt billede')
  const allowRetakeCheckbox = document.createElement('input')
  allowRetakeCheckbox.type = 'checkbox'
  allowRetakeCheckbox.id = allowRetakeLabel.getAttribute('for')
  allowRetakeCheckbox.name = allowRetakeLabel.getAttribute('for')
  allowRetakeCheckbox.checked = config.allowRetake
  allowRetakeCheckbox.addEventListener('change', (e) => {
    // @ts-expect-error: again with typescript and events
    config.allowRetake = e.target.checked
  })

  // render
  document.body
    .appendChild(header)
  document.body
    .appendChild(description)

  document.body.appendChild(table([
    [schoolDropdownLabel, schoolDropdown],
    [userInputLabel, userInput],
    [userPasswordLabel, userPassword],
    [, testConnectionWrapper],
    [warningTextLabel, warningText],
    [allowRetakeLabel, allowRetakeCheckbox],
    [chooseCameraLabel, chooseCameraWrapper],
    [chooseResolutionLabel, chooseResolutionField],
    [, nextPage]
  ]))
  // effects should always run after render

  const updateLabels = () => {
    testConnectionButton.disabled = ((config.schoolId === -1) && (config.apiUser === '') && (config.apiPass === ''))
    nextPage.disabled = !(config.isFilled && testConnectionResult.classList.contains('success'))
    if (config.schoolId !== -1) {
      if (!schoolDropdown.classList.contains(filledClass))
        schoolDropdownLabel.classList.add(filledClass)
    } else {
      schoolDropdownLabel.classList.remove(filledClass)
      schoolDropdown.selectedIndex = 0
    }

    if (config.apiUser !== "") {
      if (!userInputLabel.classList.contains(filledClass))
        userInputLabel.classList.add(filledClass)
    } else {
      userInputLabel.classList.remove(filledClass)
    }

    if (config.apiPass !== "") {
      if (!userPasswordLabel.classList.contains(filledClass))
        userPasswordLabel.classList.add(filledClass)
    } else {
      userPasswordLabel.classList.remove(filledClass)
    }

    if (config.infoText && config.infoText !== "") {
      if (!warningTextLabel.classList.contains(filledClass))
        warningTextLabel.classList.add(filledClass)
    } else {
      warningTextLabel.classList.remove(filledClass)
    }

    if (config.camera && config.camera !== "") {
      if (!chooseCameraLabel.classList.contains(filledClass)) {
        const chosenCameraId = document.createElement('span')
        chooseCameraLabel.classList.add(filledClass)
        chosenCameraId.className = 'blockSpan hideOverflow chosenCameraId'
        chosenCameraId.textContent = `Kamera valgt (${config.camera})\r\n`
        chooseCameraWrapper.prepend(chosenCameraId)
      }
    } else {
      chooseCameraLabel.classList.remove(filledClass)
      chooseCameraWrapper.childNodes.forEach(child => {
        // @ts-expect-error: TS doesn't think a child has a classList
        if (child.classList.contains('chosenCameraId'))
          chooseCameraWrapper.removeChild(child)
      })
    }

    if (config.resolution && (config.resolution.height || config.resolution.width)) {
      if (!chooseResolutionLabel.classList.contains(filledClass)) {
        chooseResolutionLabel.classList.add(filledClass)
        chooseResolutionField.textContent = (config.resolution.name + '\r\n' || `${config.resolution.width} × ${config.resolution.height}\r\n`)
      }
    } else {
      chooseResolutionLabel.classList.remove(filledClass)
      chooseResolutionField.textContent = "Vælg et kamera først"
    }

  }
  window.addEventListener('configUpdated', updateLabels)

  const testConnectionAsync = async () => {
    testConnectionResult.classList.add('running')
    testConnectionResult.textContent = ''
    try {
      // @ts-expect-error: electron isn't fully typed
      const response = await window.lectioApi.SayHelloAsync(config.getConfig)
      testConnectionResult.classList.remove('running')
      testConnectionResult.classList.add('success')
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



  updateLabels()
  addSchoolsAsync(schoolDropdown, config)
}

const addSchoolsAsync = async (parentElement: HTMLSelectElement, config: Configuration) => {
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

const loadCameras = async (containerElement: HTMLElement, config: Configuration) => {
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
        chooseCamera(camera, config)
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

const chooseCamera = async (camera: cameraData, config: Configuration) => {
  config.camera = camera.deviceId
  const containerElement = chooseResolutionField.parentElement
  containerElement.textContent = 'Finder tilgængelige opløsninger'
  camera = await solveCameraResolutions(camera)
  if (camera && camera.verifiedResolutions && camera.verifiedResolutions.length) {
    containerElement.textContent = ''
    const choose = document.createElement('span')
    choose.className = 'blockSpan'
    choose.textContent = 'Vælg en opløsning'
    containerElement.appendChild(choose)
    for (const resolution of camera.verifiedResolutions) {
      const resolutionSelector = document.createElement('span')
      resolutionSelector.className = 'clickSpan'
      resolutionSelector.addEventListener('click', (e) => {
        config.resolution = resolution
        // @ts-expect-error: typescript doesn't understand events
        e.target.parentElement.childNodes.forEach(element => {
          element.classList?.remove('selected')
        });
        // @ts-expect-error: typescript doesn't understand events
        e.target.classList.add('selected')
      })
      resolutionSelector.textContent = resolution.name
      containerElement.appendChild(resolutionSelector)
    }
  } else {
    containerElement.textContent = 'Ingen tilgængelige opløsninger fundet?'
  }
}