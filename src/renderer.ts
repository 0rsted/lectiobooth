// eslint-disable-next-line import/no-unresolved
import 'unfonts.css'
import './index.css';
import { Configuration } from './functions/config';
import { Pages } from './screens'
import { changePage, PageManager } from './functions/changePage';
import { KeyHandler, Easter, AddKey } from './functions/keyHandler';

new KeyHandler(window)
new PageManager(window, document.body)
const config = new Configuration()
// config.clearUserCpr()
document.documentElement.style.setProperty("--schoolPrimaryColor", config.schoolPrimaryColor)
document.documentElement.style.setProperty("--schoolSecondaryColor", config.schoolSecondaryColor)
window.dispatchEvent(Easter(() => window.dispatchEvent(changePage(Pages.EASTER))))
window.dispatchEvent(AddKey('clearSettings', {
  key: 'F12',
  altKey: true,
  ctrlKey: false,
  fnc: () => {
    config.reset()
  }
}))
window.dispatchEvent(AddKey('openSettings', {
  key: 'F12',
  altKey: false,
  ctrlKey: false,
  fnc: () => {
    window.dispatchEvent(changePage(Pages.SETUP))
  }
}))

window.addEventListener('configUpdated', () => {
  document.documentElement.style.setProperty("--schoolPrimaryColor", config.schoolPrimaryColor)
  document.documentElement.style.setProperty("--schoolSecondaryColor", config.schoolSecondaryColor)
  window.dispatchEvent(changePage(Pages.SETUP))
})

if (config.isFilled) {
  if (config.userCpr) {
    window.dispatchEvent(changePage(Pages.PICTUREINTERMEDIATE))
  } else {
    window.dispatchEvent(changePage(Pages.SCAN))
  }
} else {
  window.dispatchEvent(changePage(Pages.SETUP))
}
