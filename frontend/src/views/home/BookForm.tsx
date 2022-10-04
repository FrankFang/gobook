import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Error } from '../../components/Error'
import type { ErrorsOf } from '../../lib/validate'
import { hasError, validate } from '../../lib/validate'
import { useBookForm } from '../../stores/useBookForm'
import { useBooks } from '../../stores/useBooks'
export const BookForm: React.FC = () => {
  const { books, createBook, listingBooks } = useBooks()
  const { bookForm, setBookForm } = useBookForm()
  const [errors, setErrors] = React.useState<ErrorsOf<typeof bookForm>>(
    { name: [] })
  const nav = useNavigate()
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = await validate(bookForm, [
      { key: 'name', type: 'required', message: '请输入书名' },
      { key: 'name', type: 'notIncluded', in: books.map(b => b.name), message: '书名已存在' },
    ])
    setErrors(errors)
    if (!hasError(errors)) {
      const book = await createBook(bookForm.name!)
      if (book?.id)
        nav(`/books/${book.id}/edit`)
      setBookForm({ name: '' })
    }
  }
  return (
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
              onChange={e => setBookForm({ name: e.target.value })} />
          </label>
        </div>
        <div mt-4>
          <Button disabled={listingBooks} type="submit">开始创作</Button>
        </div>
      </form>
    </section>
  )
}
