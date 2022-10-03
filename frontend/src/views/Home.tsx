import * as React from 'react'
import logo from '../assets/icons/logo.svg'
import { useState } from 'react'
import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { useBookForm } from '../stores/useBookForm'
import { ErrorsOf, hasError, validate } from '../lib/validate'
import { useNavigate } from 'react-router-dom'
import { useBooks } from '../stores/useBooks'
import { useToggle } from '../hooks/useToggle'
export const Home: React.FC = () => {
  const { bookForm, setBookForm } = useBookForm()
  const [errors, setErrors] = useState<ErrorsOf<typeof bookForm>>({
    name: [],
    path: []
  })
  const [canSubmit, toggleCanSubmit] = useToggle(false)
  const [existingBook, setExistingBook] = useState<main.Book>()
  const { books, createBook } = useBooks()
  const onSelectDir = async () => {
    toggleCanSubmit(false)
    const path = ""
    const book = {} as any
    if (book) {
      setExistingBook(book)
      setBookForm({ ...book })
    } else {
      setBookForm({ path })
    }
    toggleCanSubmit(true)
  }
  const nav = useNavigate()
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validate(bookForm, [
      {
        key: 'path',
        type: 'required',
        message: '请选中一个文件夹'
      },
      {
        key: 'name',
        type: 'required',
        message: '请输入书名'
      }
    ])
    // setErrors(errors)
    // if (!hasError(errors)) {
    //   if (existingBook) {
    //     nav(`/books/${existingBook.id}/edit`)
    //   } else {
    //     const b = new main.Book(bookForm)
    //     const book = await createBook(b).catch(reason => alert('失败:' + reason))
    //     if (book?.id) {
    //       nav(`/books/${book.id}/edit`)
    //     }
    //   }
    // }
  }
  const { removeBooks } = useBooks()
  const onClearHistory = async () => {
    removeBooks()
  }
  return (
    <div h-screen flex font-sans overflow-hidden>
      <div shrink-0 b-1 p-8 flex flex-col justify-center gap-y-8>
        <div>
          <img w-218px src={logo} />
        </div>
        <header text-4xl>
          <h1>GoBook</h1>
          <h2>分享创造价值</h2>
        </header>
      </div>
      <div grow-1 b-1 bg-gray-250 gap-y-16 overflow-auto p-16>
        <section>
          <h3 text-2xl>开始新的创作</h3>
          <form flex flex-col mt-4 onSubmit={onSubmit}>
            <div>
              <label>
                <div h-40px lh-40px flex gap-x-1em>
                  所在目录
                  <Error value={errors.path} />
                </div>
                <input
                  type="text"
                  readOnly
                  h-40px
                  w-20em
                  b-rounded-1
                  rounded-tr-0
                  rounded-br-0
                  pl-2
                  pr-2
                  value={bookForm.path}
                  onChange={e => {
                    setBookForm({ path: e.target.value })
                  }}
                />
                <Button rounded-tl-0 rounded-bl-0 onClick={onSelectDir}>
                  打开目录
                </Button>
              </label>
            </div>
            <div>
              <label>
                <div h-40px lh-40px flex gap-x-1em>
                  书名
                  <Error value={errors.name} />
                </div>
                <input
                  type="text"
                  h-40px
                  w-20em
                  b-rounded-1
                  pl-2
                  pr-2
                  value={bookForm.name}
                  onChange={e => setBookForm({ name: e.target.value })}
                />
              </label>
            </div>
            <div mt-8>
              <Button disabled={!canSubmit} type="submit">
                {existingBook ? '继续创作' : '开始创作'}
              </Button>
            </div>
          </form>
        </section>
        {books?.length > 0 ? (
          <section mt-16>
            <header flex justify-between>
              <h3 text-2xl>最近的创作</h3>
              <button color-blue onClick={onClearHistory}>
                清空历史
              </button>
            </header>
            <ol flex flex-wrap gap-x-8 mt-4>
              {books.map(b => (
                <li w-16em key={b.id}>
                  <Card book={b} />
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </div>
  )
}

type Card = {
  book: main.Book
}
const Card: React.FC<Card> = ({ book }) => {
  const nav = useNavigate()
  const onClick = () => {
    nav(`/books/${book.id}/edit`)
  }
  return (
    <div shadow bg-white p-4 mt-4 hover-shadow-xl onClick={onClick}>
      <h2 text-2xl overflow-hidden>
        {book.name}
      </h2>
      <p h-3em text-gray line-clamp-2 mt-2 mb-2>
        讲述作者五十年来的人生 讲述作者五十年来的人生 讲述作者五十年来的人生 讲述作者五十年来的人生
        讲述作者五十年来的人生 讲述作者五十年来的人生 讲述作者五十年来的人生 讲述作者五十年来的人生
        讲述作者五十年来的人生 讲述作者五十年来的人生 讲述作者五十年来的人生 讲述作者五十年来的人生
      </p>
      <p>字数：8976</p>
    </div>
  )
}

type ButtonProps = {
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

const Button: React.FC<ButtonProps> = props => {
  const { children, ...rest } = props
  return (
    <button type="button" h-40px bg-blue text-white pl-4 pr-4 b-rounded-1 disabled-bg-gray {...rest}>
      {children}
    </button>
  )
}

const Error: React.FC<{ value?: string[] }> = ({ value }) => {
  return value && value.length > 0 ? <span text-red>{value.join(' ')}</span> : null
}
