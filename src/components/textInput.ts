export const textInput = (id: string, value?: string, onChange?: (this: HTMLInputElement, ev: Event) => any, isPassword = false) => {
  const element = document.createElement('input')
  element.id = id
  element.name = id
  if(isPassword)
    element.type = 'password'
  else 
    element.type = 'text'
  element.value = value
  if (onChange && typeof onChange === 'function')
    element.addEventListener('change', onChange)
  return element
}