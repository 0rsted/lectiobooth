import doneScreen from './done'
import scanCodeScreen from './scancode'
import setupScreen from './setup'
import takeImagesScreen from './takeimages'
import easter from './easter'

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
    pageName: 'photo',
    renderer: takeImagesScreen
  },
  {
    pageName: 'easter',
    renderer: easter
  }
]