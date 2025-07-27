import { ButtonEnum, Configuration } from '../functions/config';
import { changePage } from '../functions/changePage';
import { Pages } from '.';
// eslint-disable-next-line import/no-unresolved
import silhouetSvg from '../assets/images/silhouet.svg?url'
// eslint-disable-next-line import/no-unresolved
import { AddKey, RemoveKey } from '../functions/keyHandler';
import { clearChildren } from '../functions/clearChildren';
import { spinner } from '../components';

export const id = 'takeimages'

export const renderer = async () => {
  const timeoutClick = 2
  const timeoutAutoChoose = 10
  const config = new Configuration()
  const images: HTMLCanvasElement[] = []
  let height = parseInt(window.getComputedStyle(document.documentElement)?.height) * 0.7
  let width = 0
  let videoRatio = 1
  let videoHeight = 0
  let videoWidth = 0
  let randomImageTimeout: any
  let isTakingImage = false
  let videoClipLeft: number
  let videoScale: number

  const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
      deviceId: config.camera,
      height: {
        max: 1024
      }
    }
  }
  if (!config.userCpr)
    window.dispatchEvent(changePage(Pages.SCAN))

  const body = document.body
  body.style.textAlign = 'center'

  //#region TableDesign
  //setup the table for the page
  const table = document.createElement('table')
  table.className = 'absoluteCenter'
  const tBody = document.createElement('tbody')
  table.append(tBody)
  const row1 = document.createElement('tr')
  const row2 = document.createElement('tr')
  const row3 = document.createElement('tr')
  const row4 = document.createElement('tr')
  tBody.append(row1, row2, row3, row4)
  const row1cell1 = document.createElement('td')
  const row1cell2 = document.createElement('td')
  const row1cell3 = document.createElement('td')
  const spacer = document.createElement('div')
  spacer.style.width = '180px'
  row1cell1.append(spacer.cloneNode())
  row1cell3.append(spacer.cloneNode())
  row1.append(row1cell1, row1cell2, row1cell3)
  const title = document.createElement('h1')
  title.innerText = "Tag billedet"
  const instructions = document.createElement('span')
  instructions.innerText = `Gør klar til at tage billedet\nsørg for at dit hoved er inden for den sorte streg men uden for den stiplede.\nTryk på ${config.buttonAlias[ButtonEnum.KEY_0]} for at tage billedet\nDu kan tage ${config.numImages} billeder og derefter vælge det du synes er bedst.`
  const warning = document.createElement('span')
  warning.innerText = config.infoText
  const lineBreak = document.createElement('br')
  row1cell2.append(title, instructions, lineBreak, warning)
  const imageCell0 = document.createElement('td')
  const videoCell = document.createElement('td')
  videoCell.rowSpan = 3
  const imageCell1 = document.createElement('td')
  row2.append(imageCell0, videoCell, imageCell1)
  const imageCell2 = document.createElement('td')
  const imageCell3 = document.createElement('td')
  row3.append(imageCell2, imageCell3)
  const imageCell4 = document.createElement('td')
  const imageCell5 = document.createElement('td')
  row4.append(imageCell4, imageCell5)
  body.append(table)
  //#endregion

  const wrapper = document.createElement('div')
  wrapper.className = 'wrapper'
  videoCell.append(wrapper)

  const silhouet = document.createElement('img')
  silhouet.src = silhouetSvg
  silhouet.height = height
  const videoElement = document.createElement('video')
  const videoWrapper = document.createElement('div')
  videoWrapper.className = 'videoWrapper'
  videoWrapper.append(videoElement)
  wrapper.append(videoWrapper, silhouet)

  const imageCells = [imageCell0, imageCell1, imageCell2, imageCell3, imageCell4, imageCell5]

  //#region effects
  const setSize = async () => {
    height = parseInt(window.getComputedStyle(document.documentElement)?.height) * 0.7
    silhouet.height = height
    width = parseInt(window.getComputedStyle(silhouet)?.width)
    console.log({height, width})
    videoElement.height = height
    videoElement.width = height * videoRatio
    videoClipLeft = ((height * videoRatio) - width) / 2
    videoScale = (height / videoHeight)
    videoElement.style.transform = `translateX(-${videoClipLeft}px)`
    silhouet.style.transform = `translateX(-${(width)}px)`
    videoWrapper.style.height = `${height}px`
    wrapper.style.width = `${width}px`
    videoWrapper.style.width = `${width}px`
    videoWrapper.style.maxWidth = `${width}px`
  }

  const takeImage = () => {
    if (isTakingImage)
      return false

    isTakingImage = true
    let currNum = timeoutClick
    const dialog = document.createElement('dialog')
    document.body.append(dialog)
    dialog.showModal()
    const countdownNumber = document.createElement('div')
    countdownNumber.style.fontSize = `${(height / 3) * 2}px`
    dialog.append(countdownNumber)
    const imageTick = () => {
      if (currNum === 0) {
        countdownNumber.remove()
        click()
        setTimeout(() => { dialog.close(); dialog.remove() }, 1500)
      } else {
        countdownNumber.textContent = currNum.toString()
        currNum--
        setTimeout(imageTick, 1000)
      }
    }
    imageTick()
  }

  const click = () => {
    console.log('click')
    const imageId = images.length
    const imageCell = imageCells[imageId]
    const buttonId = imageId + 1
    const imageTitle = document.createElement('div')
    imageTitle.textContent = `Billede ${buttonId}`
    const imageCanvas = document.createElement('canvas')
    images[imageId] = imageCanvas
    const ctx = imageCanvas.getContext('2d')
    imageCanvas.width = 180
    imageCanvas.height = 240
    videoElement.srcObject
    ctx.drawImage(videoElement, (videoClipLeft/videoScale), 0, (videoHeight/(imageCanvas.height / imageCanvas.width)), videoHeight, 0, 0, imageCanvas.width, imageCanvas.height)
    imageCell.append(imageTitle, imageCanvas)
    if (buttonId === config.numImages)
      stopCamera()
    isTakingImage = false
  }

  const stopCamera = () => {
    const doneText = document.createElement('p')
    const lineBreak = document.createElement('br')
    doneText.append(document.createTextNode(`Du har nu taget de ${config.numImages} billeder du kan tage, og skal nu vælge billedet til lectio.`), lineBreak.cloneNode(), lineBreak.cloneNode())
    const timeoutWarning = document.createTextNode('')
    for (let i = 1; i <= config.numImages; i++) {
      // @ts-expect-error : I could probably do this better, but this works!
      const key = ButtonEnum[`KEY_${i}`] as ButtonEnum
      // @ts-expect-error : I could probably do this better, but this works!
      doneText.append(document.createTextNode(`For at vælge billede ${i}, tryk da på ${config.buttonAlias[ButtonEnum[`KEY_${i}`]]}`), lineBreak.cloneNode())
      window.dispatchEvent(AddKey(key, {
        key,
        fnc: () => {
          chooseImage(i - 1)
          clearTimeout(randomImageTimeout)
          timeoutWarning.remove()
        }
      }))
    }
    window.dispatchEvent(RemoveKey(ButtonEnum.KEY_0))
    clearChildren(videoCell)
    videoCell.removeAttribute('style')
    doneText.append(lineBreak.cloneNode(), lineBreak.cloneNode())
    doneText.appendChild(timeoutWarning)
    let currentCount = timeoutAutoChoose
    const randomImage = Math.floor(Math.random() * images.length)
    const chooseImageTimeout = () => {
      if (currentCount === 0)
        return chooseImage(randomImage)
      timeoutWarning.textContent = `Hvis du ikke har valgt et billede inden ${currentCount} sekunder, vælger vi automatisk billede nummer ${randomImage + 1}`
      currentCount--
      randomImageTimeout = setTimeout(chooseImageTimeout, 1000)
    }
    chooseImageTimeout()
    videoCell.append(doneText)
    console.log('vi stopper kameraet, alle billeder er taget')
  }

  const chooseImage = (imageId: number) => {
    clearChildren(videoCell)
    const image = (images[imageId] as HTMLCanvasElement).toDataURL('image/jpeg', 1)
    const showImage = document.createElement('img')
    showImage.src = image
    const imageText = document.createTextNode('Du har nu valgt et billede, og det bliver lagt på lectio - øjeblik')
    videoCell.append(imageText, showImage, spinner())
    console.log(imageId)
  }

  window.addEventListener('resize', setSize)
  window.dispatchEvent(AddKey(ButtonEnum.KEY_0, {
    key: ButtonEnum.KEY_0,
    fnc: () => {
      takeImage()
    }
  }))
  setSize()

  const mediaReceived = (stream: MediaStream) => {
    const { width, height } = stream.getTracks()[0].getSettings()
    videoHeight = height
    videoWidth = width
    videoRatio = videoWidth / videoHeight
    videoElement.srcObject = stream
    tryPlayVideo(videoElement).then(setSize)
  }

  navigator.mediaDevices.getUserMedia(constraints).then(mediaReceived).catch(console.error)
  //#endregion
}

export const unRender = () => {
  document.body.removeAttribute('style')
  console.log('unRender')
}

const isVideoPlaying = (videoElemet: HTMLVideoElement): boolean => (videoElemet.currentTime > 0 && !videoElemet.paused && videoElemet.readyState > 2)

const tryPlayVideo = async (videoElement: HTMLVideoElement): Promise<boolean> => {
  if (videoElement?.ended) {
    // tslint:disable-next-line:no-console
    console.error('Trying to play video that has ended.');
    return false;
  }
  if (isVideoPlaying(videoElement)) {
    // tslint:disable-next-line:no-console
    console.warn('Trying to play video that is already playing.');
    return true;
  }
  try {
    await videoElement.play();
    return true;
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.warn('It was not possible to play the video.', error);
    return false;
  }
}