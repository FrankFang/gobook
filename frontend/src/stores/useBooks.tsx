import { CreateBook, Greet, ListBooks } from '../../wailsjs/go/main/App'
import type { db } from '../../wailsjs/go/models'
import { createStore } from '../shared/zustand-helper'

interface State {
  books: any[]
  createBook: (name: string) => Promise<any>
  getBook: (id: string) => db.Book | undefined
  findBook: (attrs: Partial<db.Book>) => db.Book | undefined
  removeBooks: () => Promise<void>
  listBooks: () => Promise<void>
  listingBooks: boolean
}
export const useBooks = createStore<State>((set, get) => ({
  books: [],
  listingBooks: false,
  createBook: async name => {
    const book = await CreateBook(name)
    set(state => {
      state.books.push(book)
    })
    return book
  },
  getBook: id => get().books.find(b => b.id === id),
  findBook: (attrs: Partial<any>) =>
    get().books.find((b: any) => {
      return Object.keys(attrs).every(key => b[key] === (attrs as any)[key])
    }),
  removeBooks: async () => {
    // await RemoveBooks()
    set(state => { state.books = [] })
  },
  listBooks: async () => {
    set(state => { state.listingBooks = true })
    const books = await ListBooks(1).finally(() => {
      set(state => { state.listingBooks = false })
    })
    set(state => { state.books = books ?? [] })
  },

  // recoverBook: async (id: string) => {
  // }
}))

// LoadBooks().then(books => {
//   useBooks.setState({ books: books ?? [] })
// })
