import { CreateBook, Greet, ListBooks } from '../../wailsjs/go/main/App'
import { createStore } from '../shared/zustand-helper'

interface State {
  books: any[]
  createBook: (book: any) => Promise<any>
  getBook: (id: string) => any | undefined
  findBook: (attrs: Partial<any>) => any | undefined
  removeBooks: () => Promise<void>
  listBooks: () => Promise<any>
  listingBooks: boolean
}
export const useBooks = createStore<State>((set, get) => ({
  books: [],
  listingBooks: false,
  createBook: async (b) => {
    const book = await CreateBook(b.name)
    set((state) => {
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
    set((state) => {
      state.books = []
    })
  },
  listBooks: async () => {
    set((state) => {
      state.listingBooks = true
    })
    const books = await ListBooks()
    set((state) => {
      state.books = books
      state.listingBooks = false
    })
  },

  // recoverBook: async (id: string) => {
  // }
}))

// LoadBooks().then(books => {
//   useBooks.setState({ books: books ?? [] })
// })
