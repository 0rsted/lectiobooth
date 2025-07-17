// eslint-disable-next-line import/no-unresolved
import 'unfonts.css'
import './index.css';
import { Configuration } from './functions/config';
import { screens } from './screens'
import { changePage } from './functions/changePage';

const config = new Configuration()
config.clearUserCpr()

let currentScreen = 'setup'

window.addEventListener('changePage', ({ detail: { pageName } }: CustomEvent) => {
  if (pageName === currentScreen)
    return false

  console.log('event.changePage', pageName)
  const screenData = screens.find(e => e.pageName === pageName)
  if (screenData) {
    currentScreen = screenData.pageName
    screenData.renderer()
  }
  else
    throw new Error(`unknown screen ${pageName}`)
})

window.addEventListener('configUpdated', () => {
  if (currentScreen !== 'setup' && !config.isFilled)
    changePage('setup')
})

const KonamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'B', 'A']
let KonamiPos = 0

const keyEvents = [
  {
    key: 'F12',
    altKey: true,
    ctrlKey: false,
    fnc: () => {
      config.reset()
    }
  }
]

const keyListener = ({key, altKey, ctrlKey, ...rest}: KeyboardEvent) => {
  console.log('event.keyUp', key, altKey, ctrlKey, rest)
  if (key.toLowerCase() === KonamiCode[KonamiPos].toLowerCase()) {
    console.log('event.konami', KonamiPos, KonamiCode.length)
    KonamiPos++
    if (KonamiPos === KonamiCode.length) {
      console.log('KONAMI')
      changePage('easter')
      KonamiPos = 0
    }
  } else { KonamiPos = 0 }
  keyEvents.find((keyEvent) => (
    keyEvent.key.toLowerCase() === key.toLowerCase() &&
    keyEvent.altKey === altKey &&
    keyEvent.ctrlKey === ctrlKey)
  )?.fnc()
}

window.addEventListener('keyup', keyListener)

if(config.isFilled) {
  changePage('scan')
} else {
  changePage('setup')
}
