import * as React from 'react'
import type { ChangeEventHandler, ClipboardEventHandler } from 'react'
import { useParams } from 'react-router-dom'
import { useDebounce } from 'react-use'
import { useBook } from '../../stores/useBook'
import { UploadImage } from '../../../wailsjs/go/main/App'
export const Editor: React.FC = () => {
  const { chapters, updateLocalChapter, updateRemoteChapter } = useBook()
  const { chapterId } = useParams<{ bookId: string; chapterId: string }>()
  const chapter = chapters.find(c => c.id === parseInt(chapterId!))
  const onChange: ChangeEventHandler<HTMLTextAreaElement> = e => {
    const content = e.target.value
    if (chapterId === undefined) { return }
    updateLocalChapter(parseInt(chapterId), { content })
  }
  useDebounce(() => {
    if (chapter === undefined) { return }
    updateRemoteChapter(chapter.id, { content: chapter.content })
  }, 1000, [chapter, chapter?.content])
  const onPaste: ClipboardEventHandler<HTMLTextAreaElement> = e => {
    // 获取剪贴板中的图片
    const items = e.clipboardData?.items
    if (items === undefined) { return }
    if (chapter === undefined) { return }
    if (chapter.content === undefined) { return }
    const textarea = (e.target as HTMLTextAreaElement)
    const position = textarea.selectionEnd
    const start = chapter.content.slice(0, position)
    const end = chapter.content.slice(position)
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file' && item.type.includes('image')) {
        const file = item.getAsFile()
        if (!file) { return }
        // convert file to base64 string
        const reader = new FileReader()
        reader.onload = async e => {
          const dataUrl = e.target?.result
          if (!dataUrl) { return }
          const relativePath = await UploadImage(dataUrl as string)
          const insert = `![${file.name}](${relativePath})`
          updateLocalChapter(
            parseInt(chapterId!),
            {
              content: `${start}${insert}${end}`
            }
          )
          setTimeout(() => {
            textarea.selectionStart = position + insert.length
            textarea.selectionEnd = position + insert.length
          })
        }
        reader.readAsDataURL(file)
      }
    }
  }
  return (
    chapter
      ? <div flex flex-col>
          <textarea text-lg h-screen grow-1 bg-gray-250 p-4 resize-none
            placeholder="请在这里输入文字"
            value={chapter.content} onChange={onChange}
            onPaste={onPaste}
            />
        </div>
      : <div>404</div>
  )
}
