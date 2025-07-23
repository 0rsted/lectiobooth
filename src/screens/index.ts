import { doneScreen } from './done'
import { easter } from './easter'
import { pictureIntermediateScreen } from './pictureintermediate'
import { scanCodeScreen, unRender as unRenderScan } from './scancode'
import { setupScreen } from './setup'
import { takeImagesScreen, unRender as unRenderTakeImages } from './takeimages'

export const Pages = {
  SETUP: {
    id: 'setup',
    renderer: setupScreen
  },
  SCAN: {
    id: 'scan',
    renderer: scanCodeScreen,
    unRender: unRenderScan
  },
  PICTUREINTERMEDIATE: {
    id: 'pictureintermediate',
    renderer: pictureIntermediateScreen
  },
  TAKEIMAGE: {
    id: 'takeimage',
    renderer: takeImagesScreen,
    unRender: unRenderTakeImages
  },
  DONE: {
    id: 'done',
    renderer: doneScreen
  },
  EASTER: {
    id: 'easter',
    renderer: easter
  }
}

export const screens = [
  {
    pageName: 'setup',
    renderer: setupScreen
  },
  {
    pageName: 'scan',
    renderer: scanCodeScreen
  },
  {
    pageName: 'done',
    renderer: doneScreen
  },
  {
    pageName: 'pictureintermediate',
    renderer: pictureIntermediateScreen
  },
  {
    pageName: 'takeimage',
    renderer: takeImagesScreen
  },
  {
    pageName: 'easter',
    renderer: easter
  }
]