import { BrowserMultiFormatOneDReader } from '@zxing/browser';
import { changePage } from '../functions/changePage';
import { table } from '../components';
import { Configuration, ButtonEnum } from '../functions/config';
import { CPR } from '../functions/cpr';
import { AddKey, RemoveKey } from '../functions/keyHandler';
import { Pages } from '.';

export const id = 'scancode'

export const renderer = async () => {
  const config = new Configuration()
  if (!config.camera) {
    window.dispatchEvent(changePage(Pages.SCAN))
    return
  }
  document.body.setAttribute('style', 'text-align:center;')
  const reader = new BrowserMultiFormatOneDReader()
  reader.possibleFormats = [2, 3, 4]
  const header = document.createElement('h1')
  header.textContent = 'Scan dit sundhedskort'
  const subtitle = document.createElement('h4')
  subtitle.textContent = '(enten telefon eller det fysiske kort)'
  const previewVideo = document.createElement('video')
  previewVideo.id = 'previewVideo'
  previewVideo.height = 480
  previewVideo.width = 640
  const previewCanvas = document.createElement('canvas')
  previewCanvas.id = 'previewCanvas'
  previewCanvas.height = previewVideo.height
  previewCanvas.width = previewVideo.width
  previewCanvas.style.display = 'none'
  const stopButton = document.createElement('button')
  stopButton.textContent = `Stop kamera (${config.buttonAlias[ButtonEnum.KEY_0]})`
  stopButton.disabled = true
  const startButton = document.createElement('button')
  startButton.textContent = `Start kamera (${config.buttonAlias[ButtonEnum.KEY_1]})`
  startButton.disabled = false
  const preview = document.createElement('slot')
  preview.append(previewVideo, previewCanvas)
  const buttons = document.createElement('slot')
  buttons.append(stopButton, startButton)
  const result = document.createElement('span')
  const next = document.createElement('button')
  next.textContent = 'Gør klar til billederne'
  next.disabled = true
  const resultArea = document.createElement('slot')
  resultArea.append(result, next)
  document.body.appendChild(table([[header], [subtitle], [buttons], [preview], [resultArea]], {className: 'absoluteCenter'}))

  const scanComplete = () => setTimeout(() => window.dispatchEvent(changePage(Pages.PICTUREINTERMEDIATE)), 5000)
  const startScan = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          deviceId: config.camera,
          height: {max: 768},
          width: {max: 1024},
        }
      }
      const controls = await reader.decodeFromConstraints(constraints, 'previewVideo', (result, error) => {
        if (result) {
          if (!(new CPR(result.getText())).isValid)
            return
          previewCanvas.height = previewVideo.videoHeight
          previewCanvas.width = previewVideo.videoWidth
          const context = previewCanvas.getContext('2d')
          context.drawImage(previewVideo, 0, 0, previewCanvas.width, previewCanvas.height)
          const points = result.getResultPoints()
          context.lineWidth = 4;
          context.strokeStyle = "red";
          context.beginPath()
          context.moveTo(points[0].getX(), points[0].getY())
          context.lineTo(points[1].getX(), points[1].getY())
          context.stroke()
          previewVideo.style.display = 'none'
          previewCanvas.style.display = 'block'
          config.userCpr = result.getText()
          scanComplete()
          return controls.stop()
        }
        if (error.name !== 'NotFoundException2')
          console.warn({ result, error, time: Date.now() })
      })
      stopButton.addEventListener('click', () => {
        controls.stop()
        startButton.disabled = false
        stopButton.disabled = true
      })
      setTimeout(() => {
        stopButton.click()
      }, 30000);
      startButton.disabled = true
      stopButton.disabled = false
    } catch (e) {
      if (e instanceof OverconstrainedError) {
        config.camera = undefined
        window.dispatchEvent(changePage(Pages.SETUP))
      }
    }
  }
  startButton.addEventListener('click', startScan)
  startButton.click()
  window.dispatchEvent(AddKey(ButtonEnum.KEY_1, {
    key: ButtonEnum.KEY_1,
    fnc: () => {
      if (!startButton.disabled)
        startButton.click()
    }
  }))
  window.dispatchEvent(AddKey(ButtonEnum.KEY_0, {
    key: ButtonEnum.KEY_0,
    fnc: () => {
      if (!stopButton.disabled)
        stopButton.click()
    }
  }))
}

export const unRender = () => {
  document.body.removeAttribute('style')
  window.dispatchEvent(RemoveKey(ButtonEnum.KEY_1))
  window.dispatchEvent(RemoveKey(ButtonEnum.KEY_0))
}