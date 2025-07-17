import { clearChildren } from '../functions/clearChildren'
import { Configuration } from '../functions/config';

export const takeImagesScreen = () => {
  setupElements()
}
export default takeImagesScreen

const setupElements = () => {
  const config = new Configuration()
  const body = document.body
  clearChildren(body, true)
}