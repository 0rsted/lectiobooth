const storage = localStorage
const doEvent = () => window.dispatchEvent(new CustomEvent("storageUpdated"))

export const setItem = (key: string, value: string) => {
  storage.setItem(key, value)
  doEvent()
}

export const getItem = storage.getItem.bind(storage)

export const clear = () => {
  throw new Error('Do NOT call this one, use configuration.reset instead')
  storage.clear()
  doEvent()
}