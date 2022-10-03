import * as React from 'react'
import { ChangeEventHandler, useEffect } from 'react'
import { useParams, useRoutes } from 'react-router-dom'
import { useChapter } from '../stores/useChapter'
import { useDebounce } from 'react-use'
export const ArticleEdit: React.FC = () => {
  const { fetchChapter, chapter, setContent } = useChapter()
  const { bookId, articleId } = useParams<{ bookId: string; articleId: string }>()
  useEffect(() => {
    if (bookId === undefined || articleId === undefined) return
    fetchChapter(bookId, articleId)
  }, [bookId, articleId])
  const [, cancel] = useDebounce(
    () => {
      // if (chapter?.content) SaveChapter(bookId!, articleId!, chapter.content)
    },
    1000,
    [chapter?.content]
  )
  const onChange: ChangeEventHandler<HTMLTextAreaElement> = e => {
    setContent(bookId, articleId, e.target.value)
  }
  return chapter ? (
    <div flex flex-col>
      <textarea h-screen grow-1 b-1 bg-gray p-2 value={chapter.content} onChange={onChange} />
    </div>
  ) : (
    <div>正在加载...</div>
  )
}
