export enum InputType {
  TEXT = 'text',
  PASSWORD = 'password',
  COLOR = 'color',
  NUMBER = 'number',
  CHECKBOX = 'checkbox',
}

export const input = (id: string, value?: string | number, onChange?: (this: HTMLInputElement, ev: Event) => any, type: InputType = InputType.TEXT, placeholder?: string) => {
  const element = document.createElement('input')
  element.id = id
  element.name = id
  element.type = type
  if (type === InputType.CHECKBOX) {
    element.checked = value === 'true'
  } else {
    element.value = (typeof value === 'string') ? value : value.toString()
  }
  if (placeholder)
    element.placeholder = placeholder
  if (onChange && typeof onChange === 'function')
    element.addEventListener('change', onChange)
  return element
}