import { Greet } from '../../wailsjs/go/main/App'
import { createStore } from '../shared/zustand-helper'

type State = {
  books: main.Book[]
  createBook: (book: main.Book) => Promise<main.Book>
  getBook: (id: string) => main.Book | undefined
  findBook: (attrs: Partial<main.Book>) => main.Book | undefined
  removeBooks: () => Promise<void>
}
export const useBooks = createStore<State>((set, get) => ({
  books: [],
  createBook: async b => {
    const book = {} as any
    set(state => {
      state.books.push(book)
    })
    return book
  },
  getBook: id => get().books.find(b => b.id === id),
  findBook: (attrs: Partial<main.Book>) =>
    get().books.find((b: any) => {
      return Object.keys(attrs).every(key => b[key] === (attrs as any)[key])
    }),
  removeBooks: async () => {
    // await RemoveBooks()
    set(state => {
      state.books = []
    })
  }
  // recoverBook: async (id: string) => {
  // }
}))

// LoadBooks().then(books => {
//   useBooks.setState({ books: books ?? [] })
// })
