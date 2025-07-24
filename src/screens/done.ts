import { Configuration } from '../functions/config';

export const id = 'done'

export const renderer = () => {
  const config = new Configuration()
  console.log(config.allowRetake)
}