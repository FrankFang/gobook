import * as React from 'react'
import type { ChangeEventHandler, FormEventHandler } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/Button'
import { SelectCover } from '../../wailsjs/go/main/App'
export const Publish: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const onSubmit: FormEventHandler = e => {
    e.preventDefault()
  }
  const [form, setForm] = useState<{
    format: ('markdown' | 'epub' | 'web')[]
    summary: string
    cover: string
  }>({
        format: ['epub'],
        summary: '',
        cover: ''
      })
  const onChange: ChangeEventHandler<HTMLInputElement> = e => {
    const { value, checked } = e.target
    const formatValue = value as unknown as ('markdown' | 'epub' | 'web')
    if (checked) {
      setForm({ ...form, format: [...form.format, formatValue] })
    } else {
      setForm({ ...form, format: form.format.filter(f => f !== formatValue) })
    }
  }
  const onSelectFile = async () => {
    const cover = await SelectCover()
    setForm({ ...form, cover })
  }
  return <Layout
    main={
      <div p-8>
        <form x-form onSubmit={onSubmit}>
          <div>
            <div x-form-label>
              输出格式
            </div>
            <div flex gap-x-4>
              <label inline-flex gap-x-2>
                <input type="checkbox" name="format" value="markdown"
                  checked={form.format.includes('markdown')} onChange={onChange} />
                Markdown
              </label>
              <label inline-flex gap-x-2>
                <input type="checkbox" name="format" value="epub"
                  checked={form.format.includes('epub')} onChange={onChange} />
                EPUB
              </label>
              <label inline-flex gap-x-2>
                <input type="checkbox" name="format" value="web"
                  checked={form.format.includes('web')} onChange={onChange} />
                网页
              </label>
            </div>
          </div>
          <div>
            <div x-form-label>
              书籍简介
            </div>
            <textarea resize-none w-32em h-8em rd-2 p-2 b-1 shadow shadow-inset />
          </div>
          <div>
            <div x-form-label>
              封面
            </div>
            <div w-32em h-16em b-1 bg-white flex justify-center items-center
              p-4 rd-2 shadow shadow-inset cursor-pointer
              onClick={onSelectFile}>
              {form.cover
                ? <img className="max-w-100% max-h-100%" src={form.cover} alt="封面" />
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
