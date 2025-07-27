import { InputType, input } from "./input";
import { label } from "./label";

export const LabelInput = (
  id: string,
  labelText: string,
  value?: string | number,
  onChange?: (this: HTMLInputElement, ev: Event) => any,
  type = InputType.TEXT,
  placeholder?: string
): [HTMLLabelElement, HTMLInputElement] => {
  return [label(id, labelText), input(id, value, onChange, type, placeholder || labelText)]
}