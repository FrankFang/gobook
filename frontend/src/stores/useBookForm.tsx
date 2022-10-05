import type { main } from '../../wailsjs/go/models'
import { createStore } from '../shared/zustand-helper'

type FormData = Partial<main.Book>

interface State {
  bookForm: FormData
  setBookForm: (book: FormData) => void
  resetBookForm: () => void
}

export const useBookForm = createStore<State>(set => ({
  bookForm: { name: '' },
  setBookForm: book =>
    set(state => {
      Object.assign(state.bookForm, book)
    }),
  resetBookForm: () => set({ bookForm: { name: '' } }),
}))
