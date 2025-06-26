/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

// eslint-disable-next-line import/no-unresolved
import 'unfonts.css'
import './index.css';
import { getCameraData } from './functions/getCameraData';
import { selectCamera } from './functions/selectCamera';
import { getAllSchools } from './functions/getAllSchools';
import { clear } from './functions/storage';

const KonamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'B', 'A']
let KonamiPos = 0

const keyEvents = [
  {
    key: 'F12',
    altKey: true,
    ctrlKey: false,
    fnc: () => {
      clear()
    }
  }
]

const keyListener = (event: KeyboardEvent) => {
  if(event.key.toLowerCase() === KonamiCode[KonamiPos].toLowerCase()) {
    KonamiPos++
    if(KonamiPos === KonamiCode.length) {
      console.log('KONAMI')
      KonamiPos = 0
    }
  } else { KonamiPos = 0 }
  keyEvents.find((keyEvent) => (
    keyEvent.key === event.key && 
    keyEvent.altKey === event.altKey && 
    keyEvent.ctrlKey === event.ctrlKey)
  )?.fnc()
}


window.addEventListener('storageUpdated', event => {console.log(JSON.stringify(event, null, ' '))})
window.addEventListener('keyup', keyListener)

const cameras = await getCameraData()
const newList = document.createElement('ul')
for (const camera of cameras) {
  const newItem = document.createElement('li')
  newItem.textContent = camera.label
    newItem.addEventListener('click', () => {
      newItem.setAttribute('open', newItem.getAttribute('open') === 'true' ? 'false' : 'true')
    })
  const subList = document.createElement('ul')
  for (const resolution of camera.verifiedResolutions) {
    const subItem = document.createElement('li')
    subItem.textContent = resolution.name
    subItem.addEventListener('click', () => {
      selectCamera(camera, resolution)
    })
    subList.appendChild(subItem)
  }
  newItem.appendChild(subList)
  newList.appendChild(newItem)
}
document.body.appendChild(newList)
const schools = await getAllSchools()
console.log({schools})
//camList.textContent += JSON.stringify({cameras}, null, '  ')
