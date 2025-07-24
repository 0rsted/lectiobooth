import { changePage } from '../functions/changePage';
import { table } from '../components';
import { Configuration } from '../functions/config';
import { BrowserMultiFormatOneDReader } from '@zxing/browser';
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
  previewVideo.height = config.resolution.height ?? 240
  previewVideo.width = config.resolution.width ?? 360
  const previewCanvas = document.createElement('canvas')
  previewCanvas.id = 'previewCanvas'
  previewCanvas.height = previewVideo.height
  previewCanvas.width = previewVideo.width
  previewCanvas.style.display = 'none'
  const stopButton = document.createElement('button')
  stopButton.textContent = 'Stop kamera'
  stopButton.disabled = true
  const startButton = document.createElement('button')
  startButton.textContent = 'Start kamera'
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
      const controls = await reader.decodeFromVideoDevice(config.camera, 'previewVideo', (result, error) => {
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
          context.strokeRect(points[0].getX(), points[0].getY(), points[1].getX() - points[0].getX(), points[1].getY() - points[0].getY())
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
        config.resolution = undefined
        window.dispatchEvent(changePage(Pages.SETUP))
      }
    }
  }
  startButton.addEventListener('click', startScan)
  startButton.click()
  window.dispatchEvent(AddKey('startCamera', {
    key: '1',
    fnc: () => {
      if (!startButton.disabled)
        startButton.click()
    }
  }))
  window.dispatchEvent(AddKey('stopCamera', {
    key: 'Escape',
    fnc: () => {
      if (!stopButton.disabled)
        stopButton.click()
    }
  }))
}

export const unRender = () => {
  document.body.removeAttribute('style')
  window.dispatchEvent(RemoveKey('startCamera'))
  window.dispatchEvent(RemoveKey('stopCamera'))
}