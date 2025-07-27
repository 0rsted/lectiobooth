import axios from "axios"
import { Configuration } from "../functions/config"
import * as soap from 'soap'

export const getAxios = () => {
  const ax = axios.create({
    adapter: 'fetch',
    headers: {
      Origin: 'https://www.lectio.dk/',
      Referer: 'https://www.lectio.dk/',
      "sec-fetch-mode": 'no-cors',
      "mode": 'no-cors',
    },
  })
  ax.defaults.headers.common['Origin'] = 'https://www.lectio.dk/'
  ax.defaults.headers.common['Referer'] = 'https://www.lectio.dk/'
  ax.defaults.headers.common['sec-fetch-mode'] = 'no-cors'
  ax.defaults.headers.common['mode'] = 'no-cors'
  return ax
}

export const getClient = async (url: string, config: Configuration) => {
  const client = await soap.createClientAsync(`${url}?singleWsdl`, {
    request: getAxios()
  })
  client.setEndpoint(url)
  client.setSecurity(new soap.BasicAuthSecurity(config.apiUser, config.apiPass))
  return client
}