import { Configuration } from '../functions/config';

export const doneScreen = () => {
  setupElements()
}

const setupElements = () => {
  const config = new Configuration()
  console.log(config.allowRetake)
}