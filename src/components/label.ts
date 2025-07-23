export const label = (forId: string, content: string) => {
  const element = document.createElement('label')
  element.setAttribute('for', forId)
  element.innerText = content
  return element
}