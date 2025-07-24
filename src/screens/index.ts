import { type Page } from '../functions/changePage'
import * as DONE from './done'
import * as EASTER from './easter'
import * as PICTUREINTERMEDIATE from './pictureintermediate'
import * as SCAN from './scancode'
import * as SETUP from './setup'
import * as TAKEIMAGE from './takeimages'

export type Pages = {
  [key: string]: Page
}

export const Pages: Pages = {
  SETUP,
  SCAN,
  PICTUREINTERMEDIATE,
  TAKEIMAGE,
  DONE,
  EASTER,
}

let hasError = false
const errorMsg: string[] = []
const existingIds: string[] = []
const idOverview: {[key: string]: string[]} = {}
for (const page in Pages) {
  const localError = []
  if (!Object.hasOwn(Pages[page], 'id'))
    localError.push('id')
  if (!Object.hasOwn(Pages[page], 'renderer'))
    localError.push('renderer')
  existingIds.push(Pages[page].id)
  idOverview[Pages[page].id] ? idOverview[Pages[page].id].push(page) :idOverview[Pages[page].id] = [page]

    if (localError.length > 0) {
      errorMsg.push(`${page} is missing ${localError.join(', and ')}\nitems found: ${Object.keys(Pages[page]).join(', ')}`)
      hasError = true
    }
}

const duplicates = existingIds.filter((item, index) => existingIds.indexOf(item) !== index)
if(duplicates.length > 0) {
  hasError = true
  duplicates.forEach(duplicate => {
    errorMsg.unshift(`The pages ${idOverview[duplicate].join(', ')} has the same ID: ${duplicate}`)
  })
}

if (hasError)
  throw new TypeError(`Pages constructor has failed: \n\n${errorMsg.join(`\n-----\n`)}`)