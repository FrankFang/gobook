import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { main } from '../../wailsjs/go/models'

type FormData = Partial<main.Book>

interface State {
  bookForm: FormData
  setBookForm: (book: FormData) => void
  resetBookForm: () => void
}

export const useBookForm = create<State>()(
  immer(
    set => ({
      bookForm: { name: '' },
      setBookForm: book =>
        set(state => {
          Object.assign(state.bookForm, book)
        }),
      resetBookForm: () => set(state => {
        state.bookForm.name = ''
      })
    })
  )
)
