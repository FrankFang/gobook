import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { CreateBook, DeleteBook, ListBooks } from '../../wailsjs/go/main/App'
import type { main } from '../../wailsjs/go/models'

type Book = main.Book
interface State {
  books: any[]
  createBook: (name: string) => Promise<any>
  getBook: (id: number) => Book | undefined
  findBook: (attrs: Partial<Book>) => Book | undefined
  deleteBook: (id: number) => Promise<void>
  listBooks: () => Promise<void>
  listingBooks: boolean
}
export const useBooks = create<State>()(
  immer(
    (set, get) => ({
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
      deleteBook: async (id: number) => {
        await DeleteBook(id)
        set(state => {
          const index = state.books.findIndex(b => b.id === id)
          state.books.splice(index, 1)
        })
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
    })
  )
)

// LoadBooks().then(books => {
//   useBooks.setState({ books: books ?? [] })
// })
