import * as React from 'react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'
import logo from '../../assets/icons/logo.svg'
import { useBook } from '../../stores/useBook'

import type { main } from '../../../wailsjs/go/models'
import { Button } from '../../components/Button'
import s from './BookEdit.module.scss'
import { ChapterList } from './ChapterList'

type Chapter = main.Chapter

export const BookEdit: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const { book, chapters, updateLocalChapter, fetchBook, updateRemoteChapter } = useBook()
  useEffect(() => {
    if (bookId === undefined) { return }
    fetchBook(parseInt(bookId))
  }, [bookId])
  useEffect(() => {
    window.console.log(book, chapters)
  }, [book, chapters])

  const [focused, setFocused] = useState<Chapter['id']>()
  return book
    ? <div h-screen flex flex-nowrap>
      <div w-20em h-screen b-1 shrink-0 flex flex-col>
        <Panels>
          <li overflow-hidden grow-0 flex flex-col shrink-0>
            <div p-16px>
              <Link to="/"><Button size="small">&lt; 返回首页</Button></Link>
            </div>
          </li>
          <li overflow-hidden grow-1 flex flex-col shrink-1>
            <Header>撰写</Header>
            <div grow-1 overflow-auto h-full shadow shadow-inset>
              <ChapterList chapters={chapters} focused={focused}
                onInput={(e, id) => updateLocalChapter(id, { name: e.target.value }) }
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    // appendChapter(id)
                  }
                }}
                onDebouncedChange={(id, name) => updateRemoteChapter(id, { name }) }
              />
              {/* {renderBookContents({
                tree: chapters,
                focused,
                onInput: (e, id) => {
                  // updateChapter(id, e.target.value)
                },
                onKeyDown: (e, id) => {
                  let newId: Chapter['id']
                  switch (e.key) {
                    case 'Enter':
                      // newId = appendChapter(id, { name: '' })
                      // setFocused(newId)
                      break
                    case 'Backspace':
                      if ((e.target as HTMLInputElement).value === '') {
                        // removeChapter(id)
                      }
                      break
                    case 'ArrowUp':
                      break
                    case 'ArrowDown':
                      break
                    case 'Tab':
                      e.preventDefault()
                      if (e.shiftKey) {
                        // unindentChapter(id)
                      }
                      else {
                        // indentChapter(id)
                      }
                      break
                    default:
                      return true
                  }
                },
                onSelect: (e, id) => {
                  nav(`/books/${book.id}/edit/articles/${id}/edit`)
                },
              })} */}
            </div>
          </li>
          <li overflow-hidden grow-0 flex flex-col shrink-0>
            <Header>发布</Header>
          </li>
        </Panels>
        <div p-16px shrink-0 flex items-center gap-x-2>
          <img src={logo} h-8 shrink-0 /> <span text-3xl>GoBook</span>
        </div>
      </div>
      <div b-1 grow-1 shrink-1 overflow-hidden className="w-[calc(100%-20em-20em)]">
        <Outlet />
      </div>
      <div w-20em b-1 shrink-0></div>
    </div>
    : <div>加载中……</div>
}

const Header: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div lh-24px py-12px bg-gray-250 text-20px px-16px shrink-0>
    {children}
  </div>
)
const Panels: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ol grow-1 flex flex-col justify-start overflow-hidden className={s.menu}>
    {children}
  </ol>
)
