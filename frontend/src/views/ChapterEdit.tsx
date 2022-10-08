import * as React from 'react'
import type { ChangeEventHandler } from 'react'
import { useEffect } from 'react'
import { useParams, useRoutes } from 'react-router-dom'
import { useDebounce } from 'react-use'
import { useChapter } from '../stores/useChapter'
import { useBook } from '../stores/useBook'
export const ChapterEdit: React.FC = () => {
  const { chapters, updateLocalChapter, updateRemoteChapter } = useBook()
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>()
  const chapter = chapters.find(c => c.id === parseInt(chapterId!))
  const onChange: ChangeEventHandler<HTMLTextAreaElement> = e => {
    const content = e.target.value
    if (chapterId === undefined) { return }
    updateLocalChapter(parseInt(chapterId), { content })
  }
  useDebounce(() => {
    if (chapter === undefined) { return }
    updateRemoteChapter(chapter.id, { content: chapter.content })
  }, 1000, [chapter, chapter?.content])
  return (
    chapter
      ? <div flex flex-col>
       <textarea h-screen grow-1 b-1 bg-gray p-2 value={chapter.content} onChange={onChange} />
     </div>
      : <div>404</div>
  )
  // const { fetchChapter, chapter, setContent } = useChapter()
  // const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>()
  // useEffect(() => {
  //   if (bookId === undefined || chapterId === undefined) { return }
  //   fetchChapter(bookId, chapterId)
  // }, [bookId, chapterId])
  // const [, cancel] = useDebounce(
  //   () => {
  //     // if (chapter?.content) SaveChapter(bookId!, chapterId!, chapter.content)
  //   },
  //   1000,
  //   [chapter?.content]
  // )
  // const onChange: ChangeEventHandler<HTMLTextAreaElement> = e => {
  //   setContent(bookId, chapterId, e.target.value)
  // }
  // return chapter
  //   ? (
  //   <div flex flex-col>
  //     <textarea h-screen grow-1 b-1 bg-gray p-2 value={chapter.content} onChange={onChange} />
  //   </div>
  //     )
  //   : (
  //   <div>正在加载...</div>
  //     )
}
