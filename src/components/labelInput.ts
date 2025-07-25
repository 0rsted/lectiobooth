import { textInput } from "./textInput";
import { label } from "./label";

export const LabelInput = (
  id: string,
  labelText: string,
  value?: string,
  onChange?: (this: HTMLInputElement, ev: Event) => any,
  isPassword = false,
  placeholder?: string
): [HTMLLabelElement, HTMLInputElement] => {
  return [label(id, labelText), textInput(id, value, onChange, isPassword, placeholder || labelText)]
}