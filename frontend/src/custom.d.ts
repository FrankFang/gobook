import { main } from '../wailsjs/go/models'
declare global {
  type JSONValue = null | boolean | string | number | JSONValue[] | Record<string, JSONValue>

  type FnKeys<T> = { [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never }[keyof T]
  type FnProps<T> = Pick<T, FnKeys<T>>

  type DataKeys<T> = { [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K }[keyof T]
  type DataProps<T> = Pick<T, DataKeys<T>>

  type Chapter = main.Chapter
  type Path = number[]
}
