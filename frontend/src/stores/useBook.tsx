import { createStore } from '../shared/zustand-helper'

type State = {
  book: any | undefined
  fetch: (id?: string) => void
  update: (attrs: Partial<any>) => void
}
export const useBook = createStore<State>((set, get) => ({
  book: undefined,
  fetch: async id => {
    if (id === undefined) return
    const book = {}
    set(state => {
      state.book = book
    })
  },
  update: attrs => {
    set(state => {
      if (state.book) Object.assign(state.book, attrs)
    })
  }
}))
