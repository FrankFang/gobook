import type { MouseEventHandler } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { RenderMarkdown } from '../../wailsjs/go/main/App'
import { useToggle } from '../hooks/useToggle'
import { useBook } from '../stores/useBook'
import { Editor } from './BookEdit/Editor'

export const ChapterEdit: React.FC = () => {
  const { chapterId } = useParams<{ bookId: string; chapterId: string }>()
  const [dragging, toggleDragging] = useToggle(false)
  const [dragFrom, setDragFrom] = useState([-1, -1])
  const [breakpoint, setBreakpoint] = useState<[number, number, '<' | '>']>([-1, -1, '<'])
  const onDragStart: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault()
    toggleDragging(true)
    setDragFrom([e.clientX, e.clientY])
  }
  const onDragEnd: MouseEventHandler<HTMLDivElement> = () => {
    toggleDragging(false)
    setDragFrom([0, 0])
    localStorage.setItem('size', size.toString())
  }
  const [size, setSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('size') || '200')
  })
  const onDragging: MouseEventHandler<HTMLDivElement> = e => {
    if (!dragging) { return }
    const [x, y] = [e.clientX, e.clientY]
    if (breakpoint[2] === '<' && x < breakpoint[0]) { return }
    if (breakpoint[2] === '>' && x > breakpoint[0]) { return }
    const [dx, dy] = [x - dragFrom[0], y - dragFrom[1]]
    const width = wrapper.current!.clientWidth
    const newSize = Math.max(Math.min(size - dx, width * 0.6), 200)
    if (newSize >= width * 0.6) {
      setBreakpoint([x, y, '<'])
    } else if (newSize <= 200) {
      setBreakpoint([x, y, '>'])
    }
    setSize(newSize)
    setDragFrom([x, y])
  }
  const { chapters } = useBook()
  const [preview, setPreview] = useState<string>('')
  const currentContent = chapterId && chapters?.find(c => c.id === parseInt(chapterId))?.content
  useEffect(() => {
    if (currentContent === undefined) { return }
    RenderMarkdown(currentContent).then(html => {
      setPreview(html)
    })
  }, [currentContent])
  const wrapper = useRef<HTMLDivElement>(null)
  return (
    <div ref={wrapper} flex flex-nowrap h-full
      onMouseMove={onDragging} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}>
      <div grow-1 shrink-1 overflow-hidden className="w-[calc(100%-20em-20em)]">
        <Editor />
      </div>
      <div z-1 shrink-0 relative style={{ width: size }}>
        <div h-full w-16px left--8px absolute top-0 hover-bg-gray-300
          onMouseDown={onDragStart} cursor-e-resize
        />
        <div h-full overflow-auto>
          <div min-h-full p-45px className="markdown-body" dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>
    </div>
  )
}
