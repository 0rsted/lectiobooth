const storage = localStorage
const doEvent = () => window.dispatchEvent(new Event("storageUpdated"))

export const setItem = (key: string, value: string) => {
  storage.setItem(key, value)
  doEvent()
}

export const getItem = storage.getItem.bind(storage)

export const clear = () => {
  storage.clear()
  doEvent()
}