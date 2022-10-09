import * as React from 'react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'
import logo from '../../assets/icons/logo.svg'
import { useBook } from '../../stores/useBook'
import 'github-markdown-css'

import type { main } from '../../../wailsjs/go/models'
import { Button } from '../../components/Button'
import s from './BookEdit.module.scss'
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
    if (bookId === undefined) { return }
    fetchBook(parseInt(bookId))
  }, [bookId])

  const [focused, setFocused] = useState<Chapter['id']>()
  const map: Record<string, (e: React.SyntheticEvent<HTMLInputElement>, id: Chapter['id']) => void>
    = useMemo(() => {
      return {
        Enter: async (e, id) => {
          const newChapter = await appendChapter(id, { name: '', content: '' })
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

  const Wrapper: React.FC< { children: ReactNode } > = React.memo(({ children }) => {
    return <div h-screen flex flex-nowrap>{children}</div>
  })
  const Aside: React.FC< { children: ReactNode } > = React.memo(({ children }) => {
    return <div w-20em h-screen shrink-0 flex flex-col>{children}</div>
  })
  const Footer: React.FC = React.memo(() => {
    return (
      <div p-16px shrink-0 flex items-center gap-x-2>
        <img src={logo} h-8 shrink-0 /> <span text-3xl>GoBook</span>
      </div>
    )
  })
  const Main: React.FC<{ children: ReactNode }> = React.memo(({ children }) => {
    return <main grow-1 >{children}</main>
  })

  const Panel: React.FC<{ children: ReactNode; active?: boolean }>
  = React.memo(({ children, active = false }) => {
    return active
      ? <li overflow-hidden grow-1 flex flex-col shrink-1>{children}</li>
      : <li overflow-hidden grow-0 flex flex-col shrink-0>{children}</li>
  })

  return book
    ? (
      <Wrapper>
        <Aside>
          <Panels>
            <Panel>
              <div p-16px>
                <Link to="/"><Button color="white" size="small">返回首页</Button></Link>
              </div>)
            </Panel>
            <Panel active>
              <Header>撰写</Header>
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
                    // setFocused(id)
                  }}
                  onDebouncedChange={(id, name) => updateRemoteChapter(id, { name })}
                />
              </div>
            </Panel>
            <Panel>
              <Link to={`/books/${bookId}/publish`}><Header>发布</Header></Link>
            </Panel>
          </Panels>
          <Footer/>
        </Aside>
        <Main>
          <Outlet />
        </Main>
      </Wrapper>
      )
    : <div>加载中……</div>
}

const Header: React.FC<{ children: ReactNode }> = React.memo(({ children }) => (
  <div lh-24px py-12px bg-gray-250 text-20px px-16px shrink-0>
    {children}
  </div>
))
const Panels: React.FC<{ children: ReactNode }> = React.memo(({ children }) => (
  <ol grow-1 flex flex-col justify-start overflow-hidden className={s.menu}>
    {children}
  </ol>
))
