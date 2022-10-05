import { GetBookWithChapters, UpdateChapter } from '../../wailsjs/go/main/App'
import { main } from '../../wailsjs/go/models'

import { createStore } from '../shared/zustand-helper'

interface State {
  book?: main.Book
  chapters: main.Chapter[]
  fetchBook: (id?: number) => void
  updateChapter: (id: number, attrs: Partial<Omit<Chapter, 'id'>>) => void
}
export const useBook = createStore<State>((set, get) => ({
  book: undefined,
  chapters: [],
  fetchBook: async id => {
    if (id === undefined) { return }
    const bwc = await GetBookWithChapters(id)
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
  async updateChapter(id, attrs) {
    const patch = Object.assign({}, get().chapters.find(c => c.id === id), attrs)
    const newC = await UpdateChapter({ ...patch, id })
    set(state => {
      const c = state.chapters.find(c => c.id === id)!
      Object.assign(c, newC)
    })
  },
}))
