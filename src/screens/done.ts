import { clearChildren } from '../functions/clearChildren'
import { Configuration } from '../functions/config';

export const doneScreen = () => {
  setupElements()
}
export default doneScreen

const setupElements = () => {
  const config = new Configuration()
  const body = document.body
  clearChildren(body, true)
}