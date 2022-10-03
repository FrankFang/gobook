import * as React from 'react'
import logo from '../assets/icons/logo.svg'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'
import { renderBookContents, useChapters } from '../stores/useChapters'
import s from './BookEdit.module.scss'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useBook } from '../stores/useBook'

export const BookEdit: React.FC = () => {
  const { book, fetch } = useBook()
  const { bookId } = useParams<{ bookId: string; articleId: string }>()
  useEffect(() => {
    fetch(bookId)
  }, [])

  const { chapters, updateChapter, fetchChapters, indentChapter, unindentChapter, appendChapter, removeChapter } =
    useChapters()
  useEffect(() => {
    if (book) fetchChapters(book)
  }, [book])
  const nav = useNavigate()
  const [focused, setFocused] = useState<Chapter['id']>()
  return book ? (
    <div h-screen flex flex-nowrap>
      <div w-20em h-screen b-1 shrink-0 flex flex-col>
        <Menu>
          <li overflow-hidden grow-1 flex flex-col shrink-auto>
            <Header>撰写</Header>
            <div grow-1 overflow-auto h-full shadow shadow-inset>
              {renderBookContents({
                tree: chapters,
                focused,
                onInput: (e, id) => {
                  updateChapter(id, e.target.value)
                },
                onKeyDown: (e, id) => {
                  let newId: Chapter['id']
                  console.log('e.key')
                  console.log(e.key)
                  switch (e.key) {
                    case 'Enter':
                      newId = appendChapter(id, { name: '' })
                      setFocused(newId)
                      break
                    case 'Backspace':
                      if ((e.target as HTMLInputElement).value === '') {
                        removeChapter(id)
                      }
                      break
                    case 'ArrowUp':
                      break
                    case 'ArrowDown':
                      break
                    case 'Tab':
                      e.preventDefault()
                      if (e.shiftKey) {
                        console.log('1111')
                        unindentChapter(id)
                      } else {
                        console.log('2222')
                        indentChapter(id)
                      }
                      break
                    default:
                      return true
                  }
                },
                onSelect: (e, id) => {
                  nav(`/books/${book.id}/edit/articles/${id}/edit`)
                }
              })}
            </div>
          </li>
          <li overflow-hidden grow-1 flex flex-col shrink-0>
            <Header>发布</Header>
          </li>
        </Menu>
        <div p-16px shrink-0 flex items-center gap-x-2>
          <img src={logo} h-8 shrink-0 /> <span text-3xl>GoBook</span>
        </div>
      </div>
      <div className="w-[calc(100%-20em-20em)]" b-1 grow-1 shrink-1 overflow-hidden>
        <Outlet />
      </div>
      <div w-20em b-1 shrink-0></div>
    </div>
  ) : (
    <div>加载中……</div>
  )
}

const Header: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div lh-24px py-12px bg-gray-250 text-20px px-16px shrink-0>
    {children}
  </div>
)
const Menu: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ol grow-1 flex flex-col overflow-hidden className={s.menu}>
    {children}
  </ol>
)
