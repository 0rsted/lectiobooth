import axios from "axios"
import { Configuration } from "../functions/config"
import * as soap from 'soap'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('client')

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
  debug('client.getClient', url, config)
  const client = await soap.createClientAsync(`${url}?singleWsdl`, {
    request: getAxios()
  })
  client.setEndpoint(url)
  client.setSecurity(new soap.BasicAuthSecurity(config.apiUser, config.apiPass))
  client.on('request', (xml: string, eid: string) => debug('client.onRequest', xml, eid))
  client.on('message', (message: string, eid: string) => debug('client.onMessage', message, eid))
  client.on('soapError', (error: any, eid: string) => debug('client.onSoapError', error, eid))
  client.on('response', (body: any, response: any, eid: string) => debug('client.onResponse', body, response, eid))
  return client
}