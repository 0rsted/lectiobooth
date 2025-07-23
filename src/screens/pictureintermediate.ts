import { changePage } from '../functions/changePage';
import { Pages } from '.';
import { clearChildren } from '../functions/clearChildren'
import { Configuration } from '../functions/config';
import { spinner, table } from '../components';

export const pictureIntermediateScreen = () => {
  setupElements()
}

const setupElements = async () => {
  const config = new Configuration()
  if (!config.userCpr) {
    window.dispatchEvent(changePage(Pages.SCAN))
    return
  }
  const activeSpinner = spinner()
  const body = document.body
  body.append(activeSpinner)
  // @ts-expect-error: electron isn't fully typed
  const response = await window.lectioApi.GetPhotoByCprAsync({ config: config.getConfig })
  const photo = response[0].GetPhotoByCprResult
  if (photo && photo.length > 0) {
    clearChildren(body)
    const existingImageTitle = document.createElement('h1')
    existingImageTitle.textContent = 'Der er allerede et billede'
    const existingImageText = document.createElement('p')
    const existingImage = document.createElement('img')
    existingImage.src = `data:image/png;base64,${photo}`
    const nextButton = document.createElement('button')
    if (config.allowRetake) {
      existingImageText.textContent = 'Din skole lader dig tage et nyt billede, klik på knappen herunder for at starte.'
      nextButton.textContent = 'Start kameraet'
      nextButton.addEventListener('click', () => window.dispatchEvent(changePage(Pages.TAKEIMAGE)))
    } else {
      existingImageText.textContent = `Din skole lader dig ikke tage et nyt billede, klik på knappen herunder for at afslutte.`
      nextButton.textContent = 'Gå tilbage'
      nextButton.addEventListener('click', () => {
        config.clearUserCpr()
        window.dispatchEvent(changePage(Pages.SCAN))
      })
    }
    let seconds = 10
    const timerText = document.createElement('slot')
    timerText.innerText = `\r\n(sker automatisk om ${seconds} sekunder)`
    existingImageText.appendChild(timerText)
    const timeout = () => {
      setTimeout(() => {
        seconds--
        timerText.innerText = `\r\n(sker automatisk om ${seconds} sekunder)`
        if (seconds === 0) {
          nextButton.click()
        } else {
          timeout()
        }
      }, 1000)
    }
    timeout()
    body.append(table([[existingImageTitle], [existingImage], [existingImageText], [nextButton]]))
  } else {
    window.dispatchEvent(changePage(Pages.TAKEIMAGE))
  }
}