import dayjs from 'dayjs'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useToggle } from 'react-use'
import type { db } from '../../../wailsjs/go/models'
import { useBooks } from '../../stores/useBooks'
export const BookList: React.FC = () => {
  const [editMode, toggleEditMode] = useToggle(false)
  const { books } = useBooks()
  return (
    books?.length > 0
      ? <section mt-16>
          <header flex justify-between border-b-1 b-gray-200 pb-2 pt-2>
            <h3 text-2xl>书籍列表</h3>
            <button color-blue onClick={() => { toggleEditMode(true) }} >
              编辑
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
      : null
  )
}

interface CardProps {
  book: db.Book
}

const Card: React.FC<CardProps> = ({ book }) => {
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
        {book.summary?.substring?.(0, 100)}
      </p>
      <p color-gray>{dayjs(book.created_at).format('YYYY-MM-DD HH:mm')}</p>
    </div>
  )
}

