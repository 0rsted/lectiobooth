import { Pages } from '.'
import { changePage } from '../functions/changePage'
import { Fireworks } from 'fireworks-js'

export const id = 'easter'

export const renderer = () => {
  const body = document.body
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
        window.dispatchEvent(changePage(Pages.SETUP))
  })
}