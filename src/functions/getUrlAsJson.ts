import * as htmlparser2 from 'htmlparser2'

export type childElement = {
  parent?: string
  prev?: string
  next?: string
  name?: string
  type?: string
  children?: childElement[]
  data?: string
  attribs: {
    href?: string
    id?: string
    class?: string
  }
}

const uselessTags = [
  'script',
  'meta',
  'style',
  'link',
  '!doctype',
  'noscript',
  'br',
]
const uselessTypes = [
  'comment',
]
const uselessClasses = [
  'footer'
]

export const removeUselessTags = (inputObject: childElement) => {
  if (
    inputObject['name'] &&
    uselessTags.includes(String(inputObject['name']).toLowerCase())
  )
    return undefined
  if (
    inputObject['type'] &&
    uselessTypes.includes(String(inputObject['type']).toLowerCase())
  )
    return undefined
  if (
    inputObject['attribs'] &&
    inputObject['attribs']['class'] &&
    uselessClasses.includes(
      String(inputObject['attribs']['class']).toLowerCase()
    )
  )
    return undefined

  if (Object.hasOwn(inputObject, 'children') &&
    Array.isArray(inputObject['children']))
    inputObject['children'] = inputObject['children'].
      map(removeUselessTags).filter(tag => tag)

  return inputObject
}

const isEmptyTag = (inputObject: childElement) => {
  if (!inputObject) return true
  if (inputObject['type'] === 'text' &&
    inputObject['data'].trim().replace(/^$\W/gm, '') === '')
    return true
  return false
}

export const removeEmptyTags = (inputObject: childElement) => {
  if (!inputObject) return undefined
  if (isEmptyTag(inputObject)) return undefined

  if (Object.hasOwn(inputObject, 'children') &&
    Array.isArray(inputObject['children']))
    inputObject['children'] = inputObject['children']
      .map(removeEmptyTags)
      .filter(tag => tag)

  return inputObject
}

export const parsedToJson = (parsed: childElement[]) => {
  const asJson = JSON.stringify(parsed, (key, value) => {
    if (key.toLowerCase() === 'parent') return undefined
    if (key.toLowerCase() === 'prev') return undefined
    if (key.toLowerCase() === 'next') return undefined
    if(!value) return undefined
    return removeUselessTags(removeEmptyTags(value))
  })

  return JSON.parse(asJson)
}

export const getUrlAsJson = async (uri: string | URL, fetchRequest: any = {method: 'GET'}) => {
  uri = new URL(uri)
  fetchRequest.url = uri
  fetchRequest.referrer =
    fetchRequest &&
    fetchRequest.headers &&
    fetchRequest.headers.referrer
  const nextRequest = new Request(uri, fetchRequest)
  const data = await fetch(nextRequest)
  if (!data.ok) throw new Error(`Response status: ${data.status}`)
  const htmlText = await data.text()
  if (!fetchRequest.headers)
    fetchRequest.headers = {}
  fetchRequest.headers.referrer = uri
  if (data.headers.get('set-cookie'))
    fetchRequest.headers.cookie = data.headers.get('set-cookie')
  return {
    dom: parsedToJson(htmlparser2.parseDocument(htmlText) as any as childElement[]),
    fetchRequest
  }
}

export default getUrlAsJson