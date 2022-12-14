import create from 'zustand'
import { immer } from 'zustand/middleware/immer'

type Store = {
  chapter?: any
  setContent: (bookId?: string, chapter?: string, content?: string) => void
  fetchChapter: (bookId: string, chapterId: string) => void
}
export const useChapter = create<Store>()(
  immer(
    (set, get) => ({
      chapter: undefined,
      setContent: (bookId, chapterId, content) => {
        set(state => {
          if (bookId === undefined || chapterId === undefined || content === undefined)
            return
          if (state.chapter === undefined)
            return
          state.chapter.content = content
        })
      },
      fetchChapter: async (bookId, chapterId) => {
        if (chapterId === undefined)
          return
        if (bookId === undefined)
          return
        const chapter = {} as any
        set(state => {
          state.chapter = chapter
        })
      }
    })
  )
)
