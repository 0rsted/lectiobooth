import { table } from '../components';
import { clearChildren } from '../functions/clearChildren'
import { Configuration } from '../functions/config';
import { BrowserMultiFormatReader } from '@zxing/browser';

const tmpObj = {
    "result": {
        "text": "2010831825",
        "rawBytes": {
            "0": 105,
            "1": 20,
            "2": 10,
            "3": 83,
            "4": 18,
            "5": 25,
            "6": 76,
            "7": 106,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "16": 0,
            "17": 0,
            "18": 0,
            "19": 0
        },
        "numBits": 0,
        "resultPoints": [
            {
                "x": 377.5,
                "y": 165
            },
            {
                "x": 219,
                "y": 165
            }
        ],
        "format": 4,
        "timestamp": 1752674766109,
        "resultMetadata": {}
    }
}

export const scanCodeScreen = () => {
  setupElements()
}
export default scanCodeScreen

const setupElements = async () => {
  const config = new Configuration()
  const reader = new BrowserMultiFormatReader()
  reader.possibleFormats = [2, 3, 4]
  const body = document.body
  clearChildren(body)
  const header = document.createElement('h1')
  header.textContent = 'Scan dit sundhedskort'
  const subtitle = document.createElement('h3')
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
  const startButton = document.createElement('button')
  startButton.textContent = 'Start kamera'
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
  document.body.appendChild(table([[header], [subtitle], [buttons], [preview], [resultArea]]))


  const controls = await reader.decodeFromVideoDevice(config.camera, 'previewVideo', (result, error) => {
    if(result) {
      if(result.getText().length !== 10)
        return
      console.log({result})
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
      return controls.stop()
    }
    if (error.name !== 'NotFoundException2')
      console.warn({ result, error, time: Date.now() })
  })

  stopButton.addEventListener('click', () => controls.stop())


}