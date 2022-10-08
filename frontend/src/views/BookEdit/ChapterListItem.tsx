import type { ChangeEvent, FocusEvent, KeyboardEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'react-use'
import { useToggle } from '../../hooks/useToggle'
import type { ChapterListProps } from './ChapterList'

export type ChapterListItemProps = {
  value: string
  path: Path
  id: Chapter['id']
  hasChildren: boolean
  children?: ReactNode
} & Omit<ChapterListProps, 'chapters'>

export const ChapterListItem: React.FC<ChapterListItemProps> = props => {
  const {
    id, path, children, hasChildren, focused, onInput: _onInput, onSelect, onKeyDown, value,
    onDebouncedChange
  } = props
  const level = path.length
  const style = { paddingLeft: `${16 + level * 4}px` }
  const [visible, toggleVisible] = useToggle(true)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (id === focused) {
      inputRef.current?.focus()
    }
  }, [focused])
  const [lastChange, setLastChange] = useState<Date>()
  useDebounce(() => {
    if (id && onDebouncedChange && value !== undefined) {
      onDebouncedChange(id, value)
    }
  }, 300, [lastChange])
  const onInput: ChapterListItemProps['onInput'] = (e, id) => {
    _onInput(e, id)
    setLastChange(new Date())
  }
  const childrenStyle = { display: visible ? 'block' : 'none' }
  return (
    <div style={style} className="menuItem">
      <label py-4px flex items-center className="menuItem-name">
        {hasChildren
          ? visible
            ? <i i-bi-chevron-down shrink-0 mr-4px
                onClick={() => toggleVisible(false)} />
            : <i i-bi-chevron-right shrink-0 mr-4px
                onClick={() => toggleVisible(true)} />
          : <i i-bi-record shrink-0 mr-4px />
            }
        <input
          ref={inputRef} lh-24px py-8px text-18px
          value={ value} shrink-1
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => onKeyDown?.(e, id)}
          onInput={(e: ChangeEvent<HTMLInputElement>) => onInput(e, id)}
          onFocus={(e: FocusEvent<HTMLInputElement>) => onSelect?.(e, id)}
        />
      </label>
      <div style={childrenStyle}>{children}</div>
    </div>
  )
}
