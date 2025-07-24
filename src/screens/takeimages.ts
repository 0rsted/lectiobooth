import { Configuration } from '../functions/config';
import { spinner } from '../components';
import { changePage } from '../functions/changePage';
import { Pages } from '.';

export const id = 'takeimages'

export const renderer = async () => {
  const config = new Configuration()
  if (!config.userCpr)
    window.dispatchEvent(changePage(Pages.SCAN))
  const activeSpinner = spinner()
  const body = document.body
  body.append(activeSpinner)
}

export const unRender = () => {
  console.log('unRender')
}