import { main } from '../wailsjs/go/models'
declare global {
  type User = {
    age: number
    name: string
  }
  type Chapter = DataProps<main.Chapter> & { parentId?: Chapter['id']; children?: Chapter[] }
  type Chapters = Chapter[]
  type JSONValue = null | boolean | string | number | JSONValue[] | Record<string, JSONValue>

  type FnKeys<T> = { [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never }[keyof T]
  type FnProps<T> = Pick<T, FnKeys<T>>

  type DataKeys<T> = { [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K }[keyof T]
  type DataProps<T> = Pick<T, DataKeys<T>>
}

// type Book = {
//   id?: string
//   name: string
//   path: string
//   createdAt?: string
// }
