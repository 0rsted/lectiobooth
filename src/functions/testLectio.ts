import { createClient, BasicAuthSecurity } from 'soap'
import { Configuration } from './config'

export const callSayHello = async () => {
  const config = new Configuration()
  if (!config.schoolId || !config.apiUser || !config.apiPass)
    throw new Error('missing required data')
  const wsdlUrl = `https://www.lectio.dk/lectio/${config.schoolId}/api/hello/v1?singleWsdl`
  return new Promise((resolve, reject) => {
    createClient(wsdlUrl, { endpoint: wsdlUrl }, (err: any, client: any) => {
      if (err)
        return reject(err)
      client.setSecurity(new BasicAuthSecurity(config.apiUser, config.apiPass))
      client.SayHello({ name: config.schoolName }, (err: any, result: any) => {
        if (err)
          return reject(err)
        resolve(result)
      })
    })
  })
}
