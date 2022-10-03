import { createStore } from '../shared/zustand-helper'

type State = {
  bookForm: Partial<main.Book>
  setBookForm: (book: Partial<main.Book>) => void
}

export const useBookForm = createStore<State>(set => ({
  bookForm: {
    path: '',
    name: ''
  },
  setBookForm: book =>
    set(state => {
      Object.assign(state.bookForm, book)
    })
}))
