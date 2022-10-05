import { GetBookWithChapters } from '../../wailsjs/go/main/App'
import type { main } from '../../wailsjs/go/models'

import { createStore } from '../shared/zustand-helper'

interface State {
  book?: main.Book
  chapters: main.Chapter[]
  fetchBook: (id?: number) => void
  updateBook: (attrs: Partial<any>) => void
}
export const useBook = createStore<State>((set, get) => ({
  book: undefined,
  chapters: [],
  fetchBook: async id => {
    if (id === undefined) { return }
    const x = await GetBookWithChapters(id)
    console.log(x)
    // if (id === undefined) { return }
    // const book = {}
    // set(state => {
    //   state.book = book
    // })
  },
  updateBook: attrs => {
    set(state => {
      if (state.book)
        Object.assign(state.book, attrs)
    })
  },
}))
