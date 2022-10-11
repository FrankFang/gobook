import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useBook } from '../../stores/useBook'
import 'github-markdown-css'

import type { main } from '../../../wailsjs/go/models'
import { Layout } from '../../components/Layout'
import { ChapterList } from './ChapterList'

type Chapter = main.Chapter

export const BookEdit: React.FC = () => {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Tab' && e.preventDefault()
    document.addEventListener('keydown', fn)
    return () => {
      document.removeEventListener('keydown', fn)
    }
  }, [])
  const { bookId } = useParams<{ bookId: string; chapterId: string }>()
  const {
    book, chapters, updateLocalChapter, fetchBook, updateRemoteChapter, appendChapter,
    findOlderBrotherInTree, findYoungerBrotherInTree, findFatherInTree, tree, flatTree, moveChapter, deleteChapter
  } = useBook()
  useEffect(() => {
    console.log('chapters: ', chapters)
  }, [chapters])
  useEffect(() => {
    if (bookId === undefined) { return }
    fetchBook(parseInt(bookId))
  }, [bookId])

  const [focused, setFocused] = useState<Chapter['id']>()
  const map: Record<string, (e: React.SyntheticEvent<HTMLInputElement>, id: Chapter['id']) => void>
    = useMemo(() => {
      return {
        Enter: async (e, id) => {
          const newChapter = await appendChapter(id, { name: '', content: '' })
          console.log('newChapter: ', newChapter)
          setFocused(newChapter.id)
        },
        Backspace: async (e, id) => {
          if ((e.target as HTMLInputElement).value === ''
            && chapters.length > 1) {
            const index = flatTree.findIndex(c => c.id === id)
            const brother = flatTree[index - 1]
            await deleteChapter(id)
            if (brother) { setFocused(brother.id) }
          }
        },
        Tab: (e, id) => {
          e.preventDefault()
          const shift = (e.nativeEvent as KeyboardEvent).shiftKey
          if (shift) {
            const father = findFatherInTree(id, tree)
            if (father) {
              moveChapter('insertAfter', id, father.id)
            }
          } else {
            const brother = findOlderBrotherInTree(id, tree)
            if (brother) {
              moveChapter('append', id, brother.id)
            }
          }
        },
        ArrowUp: (e, id) => {
          e.preventDefault()
          const alt = (e.nativeEvent as KeyboardEvent).altKey
          if (alt) {
            const brother = findOlderBrotherInTree(id, tree)
            if (brother) {
              moveChapter('insertBefore', id, brother.id)
            }
          } else {
            const index = flatTree.findIndex(n => n.id === id)
            const prev = flatTree[index - 1]
            if (prev) { setFocused(prev.id) }
          }
        },
        ArrowDown: (e, id) => {
          e.preventDefault()
          const alt = (e.nativeEvent as KeyboardEvent).altKey
          if (alt) {
            const brother = findYoungerBrotherInTree(id, tree)
            if (brother) {
              moveChapter('insertAfter', id, brother.id)
            }
          } else {
            const index = flatTree.findIndex(n => n.id === id)
            const next = flatTree[index + 1]
            if (next) { setFocused(next.id) }
          }
        }
      }
    }, [tree, flatTree])
  const nav = useNavigate()

  return book
    ? <Layout main={<Outlet />} panels={
      <>
        <li layout-panel grow-1 shrink-1>
          <h2 layout-panel-header font-bold>撰写</h2>
          <div grow-1 overflow-auto h-full shadow shadow-inset>
            <ChapterList chapters={chapters} focused={focused}
              onInput={(e, id) => {
                updateLocalChapter(id, { name: e.target.value })
              }}
              onKeyDown={(e, id) => {
                map[e.key]?.(e, id)
              }}
              onFocus={(e, id) => {
                nav(`/books/${book.id}/edit/chapters/${id}/edit`)
                setFocused(id)
              }}
              onDebouncedChange={(id, name) => updateRemoteChapter(id, { name })}
            />
          </div>
        </li>
        <li layout-panel>
          <Link to={`/books/${bookId}/publish`}>
            <h2 layout-panel-header>发布</h2>
          </Link>
        </li>
      </>
    } />
    : <div>加载中……</div>
}

