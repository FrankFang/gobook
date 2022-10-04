import * as dayjs from 'dayjs'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import logo from '../assets/icons/logo.svg'
import { useToggle } from '../../hooks/useToggle'
import { hasError, validate } from '../../lib/validate'
import { useBookForm } from '../../stores/useBookForm'
import { useBooks } from '../../stores/useBooks'

import type { ErrorsOf } from '../../lib/validate'
import type { db } from '../../../wailsjs/go/models'
import { BookList } from './BookList'
export const Home: React.FC = () => {
  const { bookForm, setBookForm } = useBookForm()
  const [errors, setErrors] = useState<ErrorsOf<typeof bookForm>>(
    { name: [] })
  const { books, createBook, listBooks, listingBooks } = useBooks()
  useEffect(() => {
    listBooks()
  }, [])
  const nav = useNavigate()
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = await validate(bookForm, [
      { key: 'name', type: 'required', message: '请输入书名' },
      { key: 'name', type: 'notIncluded', in: books.map(b => b.name), message: '书名已存在' },
    ])
    setErrors(errors)
    if (!hasError(errors)) {
      const book = await createBook(bookForm)
      if (book?.id)
        nav(`/books/${book.id}/edit`)
      setBookForm({ name: '' })
    }
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
      <div grow-1 b-1 bg-gray-250 gap-y-8 overflow-auto p-8>
        <section>
          <header border-b-1 b-gray-200 pb-2>
            <h3 text-2xl>开始新的创作</h3>
          </header>
          <form flex flex-col mt-4 onSubmit={onSubmit}>
            <div>
              <label block>
                <div h-40px lh-40px flex gap-x-1em>
                  书名
                  <Error value={errors.name} />
                </div>
                <input type="text" h-40px w-20em b-rounded-1 pl-2 pr-2 value={bookForm.name}
                  onChange={e => setBookForm({ name: e.target.value })}
                />
              </label>
            </div>
            <div mt-4>
              <Button disabled={listingBooks} type="submit">开始创作</Button>
            </div>
          </form>
        </section>
        <BookList books={books}/>
      </div>
    </div>
  )
}

type ButtonProps = {
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

const Button: React.FC<ButtonProps> = (props) => {
  const { children, ...rest } = props
  return (
    <button type="button" h-40px bg-blue text-white pl-4 pr-4 b-rounded-1
      disabled-bg-gray
      {...rest}
    >
      {children}
    </button>
  )
}

const Error: React.FC<{ value?: string[] }> = ({ value }) => {
  return value && value.length > 0
    ? <span text-red>{value.join(' ')}</span>
    : null
}
