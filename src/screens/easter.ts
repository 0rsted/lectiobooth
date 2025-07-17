import { changePage } from '../functions/changePage'
import { clearChildren } from '../functions/clearChildren'
import Fireworks from 'fireworks-js'

export const easter = () => {
  setupElements()
}
export default easter

const setupElements = () => {
  const body = document.body
  clearChildren(body, true)
  const canvas = document.createElement('canvas')
  canvas.style.height = '100vh'
  canvas.style.width = '100vw'
  body.style = 'border:0;margin:0;padding:0;overflow:hidden;'
  body.appendChild(canvas)
  const fireworks = new Fireworks(canvas)
  fireworks.start()
  body.addEventListener('dblclick', () => {
    fireworks.stop()
    body.removeAttribute('style')
    changePage('setup')
  })
}