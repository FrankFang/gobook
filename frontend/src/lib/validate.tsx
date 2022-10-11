interface FData {
  [k: string]: JSONValue
}
type Rule<T> = {
  key: keyof T
  message: string
} & (
  | { type: 'required' }
  | { type: 'pattern'; regex: RegExp }
  | { type: 'notEqual'; value: JSONValue }
  | { type: 'notIncluded'; in: unknown[] }
)
type Rules<T> = Rule<T>[]
export type ErrorsOf<F> = {
  [k in keyof F]?: string[];
}
export type { Rules, Rule, FData }
export const validate = async <T extends FData>(formData: T, rules: Rules<T>) => {
  const errors: ErrorsOf<T> = {}
  for (const rule of rules) {
    const { key, type, message } = rule
    const value = formData[key]
    switch (type) {
      case 'required':
        if (isEmpty(value)) {
          errors[key] = errors[key] ?? []
          errors[key]?.push(message)
        }
        break
      case 'pattern':
        if (!isEmpty(value) && !rule.regex.test(value!.toString())) {
          errors[key] = errors[key] ?? []
          errors[key]?.push(message)
        }
        break
      case 'notEqual':
        if (!isEmpty(value) && value === rule.value) {
          errors[key] = errors[key] ?? []
          errors[key]?.push(message)
        }
        break
      case 'notIncluded':
        if (!isEmpty(value) && rule.in.includes(value)) {
          errors[key] = errors[key] ?? []
          errors[key]?.push(message)
        }
        break
      default:
    }
  }
  return errors
}

function isEmpty(value: null | undefined | string | number | FData) {
  return value === null || value === undefined || value === ''
}

type ErrorsLike = {
  [k in string]?: string[];
}
export function hasError(errors: ErrorsLike | string[] | undefined): boolean {
  if (errors === undefined) { return false }
  if (Array.isArray(errors)) { return errors.length > 0 }
  return (
    Object.values(errors).reduce(
      (result, value) => result + (value ? value.length : 0),
      0
    ) > 0
  )
}
