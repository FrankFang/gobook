import * as React from 'react'
import type { ChangeEvent, FormEventHandler } from 'react'
import { ChangeEventHandler, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/Button'
import { PublishBook, SelectCover } from '../../wailsjs/go/main/App'
import type { ErrorsOf } from '../lib/validate'
import { hasError, validate } from '../lib/validate'
import { Error } from '../components/Error'
import { useBook } from '../stores/useBook'
import s from './Publish.module.scss'

type FData = {
  format: ('markdown' | 'epub' | 'web')[]
  summary: string
  cover: string
}
export const PublishPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const { fetchBook, book } = useBook()
  useEffect(() => {
    if (bookId === undefined) { return }
    fetchBook(parseInt(bookId))
  }, [bookId])
  const onSubmit: FormEventHandler = async e => {
    e.preventDefault()
    const errors = await validate(formData, [
      { key: 'format', type: 'required', message: '请选择导出格式' },
      { key: 'summary', type: 'required', message: '请输入书籍简介' },
      { key: 'cover', type: 'required', message: '请上传书籍封面' },
    ])
    setErrors(errors)
    if (hasError(errors)) { return }
    const { format, summary, cover } = formData
    const x = await PublishBook(parseInt(bookId!), format, summary, cover)
    console.log(x)
  }
  const [formData, setFormData] = useState<FData>({
    format: ['epub'], summary: '', cover: ''
  })
  useEffect(() => {
    if (!book) { return }
    console.log('book: ', book)
    setFormData({
      ...formData,
      summary: book.summary ?? '',
      cover: book.cover ?? ''
    })
  }, [book])
  const [errors, setErrors] = useState<ErrorsOf<FData>>({
    format: [], summary: [], cover: []
  })
  const onChange = (key: string, e: ChangeEvent) => {
    if (key === 'format') {
      const { value, checked } = e.target as HTMLInputElement
      const formatValue = value as unknown as ('markdown' | 'epub' | 'web')
      if (checked) {
        setFormData({ ...formData, format: [...formData.format, formatValue] })
      } else {
        setFormData({ ...formData, format: formData.format.filter(f => f !== formatValue) })
      }
    } else if (key === 'summary') {
      const { value } = (e.target as HTMLTextAreaElement)
      setFormData({ ...formData, summary: value })
    }
  }
  const onSelectFile = async () => {
    if (bookId === undefined) { return }
    const cover = await SelectCover(parseInt(bookId))
    setFormData({ ...formData, cover })
  }
  return <Layout
    main={
      <div p-8>
        <form x-form onSubmit={onSubmit}>
          <div>
            <div x-form-label>
              输出格式 <Error value={errors.format} />
            </div>
            <div flex gap-x-4 className={hasError(errors.format) ? s.inputError : ''}>
              <label inline-flex gap-x-2>
                <input type="checkbox" name="format" value="markdown"
                  checked={formData.format.includes('markdown')} onChange={e => onChange('format', e)} />
                Markdown
              </label>
              <label inline-flex gap-x-2>
                <input type="checkbox" name="format" value="epub"
                  checked={formData.format.includes('epub')} onChange={e => onChange('format', e)} />
                EPUB
              </label>
              <label inline-flex gap-x-2>
                <input type="checkbox" name="format" value="web"
                  checked={formData.format.includes('web')} onChange={e => onChange('format', e)} />
                网页
              </label>
            </div>
          </div>
          <div>
            <div x-form-label>
              书籍简介 <Error value={errors.summary} />
            </div>
            <textarea resize-none w-32em h-8em rd-2 p-2 b-1 shadow shadow-inset
              value={formData.summary}
              className={hasError(errors.summary) ? s.inputError : ''}
              onChange={e => onChange('summary', e)} />
          </div>
          <div>
            <div x-form-label>
              封面 <Error value={errors.cover} />
            </div>
            <div w-32em h-16em b-1 bg-white flex justify-center items-center
              p-4 rd-2 shadow shadow-inset cursor-pointer
              className={hasError(errors.cover) ? s.inputError : ''}
              onClick={onSelectFile}>
              {formData.cover
                ? <img className="max-w-100% max-h-100%" src={formData.cover} alt="封面" />
                : <span>点击选择文件</span>
              }
            </div>
          </div>
          <div mt-4>
            <Button type="submit">发布</Button>
          </div>
        </form>
      </div>
    }
    panels={<>
      <li layout-panel grow-0 shrink-0>
        <Link to={`/books/${bookId}/edit`}>
          <h2 layout-panel-header>撰写</h2>
        </Link>
      </li>
      <li layout-panel mt-2>
        <h2 layout-panel-header font-bold>发布</h2>
      </li>
    </>}
  />
}

function attr(name: string, value: boolean) {
  const opts: Record<string, boolean> = {}
  opts[name] = true
  return opts
}
