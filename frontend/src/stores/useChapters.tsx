import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { main } from '../../wailsjs/go/models'

type Chapter = main.Chapter
type Chapters = Chapter[]

interface State {
  book?: any
  chapters: Chapters
}
interface Actions {
  updateChapter: (id: Chapter['id'], name: Chapter['name']) => void
  fetchChapters: (book: any) => void
  appendChapter: (
    id: Chapter['id'],
    chapter: Partial<Omit<Chapter, 'id'>>
  ) => Chapter['id']
  removeChapter: (id: Chapter['id']) => void
  indentChapter: (id: Chapter['id']) => void
  unindentChapter: (id: Chapter['id']) => void
}
type Store = State & Actions

export const useChapters = create<Store>()(
  immer(
    set => ({
      book: undefined,
      chapters: [],
      updateChapter: (id: Chapter['id'], name: Chapter['name']) => {
        throw new Error('not implemented')
      },
      fetchChapters: async () => {
        throw new Error('not implemented')
      },
      appendChapter: () => {
        throw new Error('not implemented')
      },
      removeChapter: () => {
        throw new Error('not implemented')
      },
      indentChapter: () => {
        throw new Error('not implemented')
      },
      unindentChapter: () => {
        throw new Error('not implemented')
      },
    })
  )
)

