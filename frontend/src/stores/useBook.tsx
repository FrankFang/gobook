import { GetBookWithChapters } from '../../wailsjs/go/main/App'
import { main } from '../../wailsjs/go/models'

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
    const bwc = await GetBookWithChapters(id)
    console.log('bwc')
    console.log(bwc)
    const { chapters, ...rest } = bwc
    if (chapters?.length > 0) {
      set({ book: new main.Book(rest), chapters })
    }
    else {
      set({
        book: new main.Book(rest),
        chapters: [
          new main.Chapter({ name: 'Chapter 1', content: '' }),
        ],
      })
    }
  },
  updateBook: attrs => {
    set(state => {
      if (state.book)
        Object.assign(state.book, attrs)
    })
  },
}))
