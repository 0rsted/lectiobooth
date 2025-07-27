import { changePage } from '../functions/changePage';
import { Pages } from '.';
import { clearChildren } from '../functions/clearChildren'
import { ButtonEnum, Configuration } from '../functions/config';
import { spinner, table } from '../components';
import { AddKey, RemoveKey } from '../functions/keyHandler';

export const id = 'pictureintermediate'

export const renderer = async () => {
  const config = new Configuration()
  if (!config.userCpr) {
    window.dispatchEvent(changePage(Pages.SCAN))
    return
  }
  const activeSpinner = spinner()
  const body = document.body
  body.append(activeSpinner)
  body.setAttribute('style', 'text-align:center;')
  try {
    // @ts-expect-error: electron isn't fully typed
    const response = await window.lectioApi.GetPhotoByCprAsync({ config: config.getConfig })
    const photo = response[0].GetPhotoByCprResult
    if (photo && photo.length > 0) {
      clearChildren(body)
      const existingImageTitle = document.createElement('h1')
      existingImageTitle.textContent = 'Der er allerede et billede'
      const existingImageText = document.createElement('p')
      const existingImage = document.createElement('img')
      existingImage.src = `data:image/jpeg;base64,${photo}`
      const nextButton = document.createElement('button')
      if (config.allowRetake) {
        existingImageText.textContent = `Din skole lader dig tage et nyt billede, klik på ${config.buttonAlias[ButtonEnum.KEY_1]} for at starte.`
        nextButton.textContent = 'Start kameraet'
        nextButton.addEventListener('click', () => window.dispatchEvent(changePage(Pages.TAKEIMAGE)))
      } else {
        existingImageText.textContent = `Din skole lader dig ikke tage et nyt billede, klik på ${config.buttonAlias[ButtonEnum.KEY_1]} for at afslutte.`
        nextButton.textContent = 'Gå tilbage'
        nextButton.addEventListener('click', () => {
          config.clearUserCpr()
          window.dispatchEvent(changePage(Pages.SCAN))
        })
      }
      let seconds = 10
      const timerText = document.createElement('slot')
      timerText.innerText = `\r\n(sker automatisk om ${seconds} sekund${seconds !== 1 ? 'er':''})`
      existingImageText.appendChild(timerText)
      const timeout = () => {
        setTimeout(() => {
          seconds--
          timerText.innerText = `\r\n(sker automatisk om ${seconds} sekund${seconds !== 1 ? 'er':''})`
          if (seconds === 0) {
            nextButton.click()
          } else {
            timeout()
          }
        }, 1000)
      }
      timeout()
      window.dispatchEvent(AddKey(ButtonEnum.KEY_1, { key: ButtonEnum.KEY_1, fnc: () => nextButton.click() }))
      body.append(table([[existingImageTitle], [existingImage], [existingImageText], [nextButton]], { className: 'absoluteCenter' }))
    } else {
      window.dispatchEvent(changePage(Pages.TAKEIMAGE))
    }
  } catch (error) {
    if(error.message.includes('Der findes ikke noget billede for dette cpr nummer')) {
      // redirect to takeImage
      return window.dispatchEvent(changePage(Pages.TAKEIMAGE))
    }
    clearChildren(body)
    body.append(table([[document.createTextNode('Der findes ingen bruger med det CPR-nummer, prøv at scanne igen')], [document.createTextNode('hvis det stadig ikke virker, så tag kontakt til en underviser')]], { className: 'absoluteCenter' }))
    window.setTimeout(() => {
      config.clearUserCpr()
      window.dispatchEvent(changePage(Pages.SCAN))
    }, 10000)
  }

}

export const unRender = () => {
  document.body.removeAttribute('style')
  window.dispatchEvent(RemoveKey(ButtonEnum.KEY_1))
}