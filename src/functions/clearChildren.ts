export const clearChildren = (element: HTMLElement, hard = false) => {
  element.textContent = ""
  return

  if (hard)
    while (element.hasChildNodes())
      element.childNodes.forEach(child => document.body.removeChild(child))
  else
    for (let child of element.children) {
      element.removeChild(child)
    }
}

export default clearChildren