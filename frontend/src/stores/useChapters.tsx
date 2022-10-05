import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
} from 'react'
import React, {
  useEffect,
  useRef,
  useState,
} from 'react'
import { Collapse } from 'react-collapse'
import type { main } from '../../wailsjs/go/models'

import { createStore } from '../shared/zustand-helper'

interface TraverseParams {
  tree: Chapters
  path?: Path
  focused?: Chapter['id']
  onInput: (e: ChangeEvent<HTMLInputElement>, id: Chapter['id']) => void
  onSelect?: (e: FocusEvent<HTMLInputElement>, id: Chapter['id']) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>, id: Chapter['id']) => void
}
type MenuItemProps = {
  value: string
  path: Path
  id: Chapter['id']
  hasChildren?: boolean
  children?: ReactNode
} & Omit<TraverseParams, 'tree'>

type Path = number[]
type Chapter = main.Chapter
type Chapters = Chapter[]

interface State {
  book?: any
  chapters: Chapters
}
interface Actions {
  updateChapter: (id: Chapter['id'], name: Chapter['name']) => void
  fetchChapters: (book: any) => void
  appendChapter: (
    id: Chapter['id'],
    chapter: Partial<Omit<Chapter, 'id'>>
  ) => Chapter['id']
  removeChapter: (id: Chapter['id']) => void
  indentChapter: (id: Chapter['id']) => void
  unindentChapter: (id: Chapter['id']) => void
}
type Store = State & Actions

export const useChapters = createStore<Store>((set, get) => ({
  book: undefined,
  chapters: [],
  updateChapter: (id: Chapter['id'], name: Chapter['name']) => {
    set(state => {
      const node = findChapterById(state.chapters, id)
      if (!node)
        return
      node.name = name
    })
  },
  fetchChapters: async (book: any) => {
    // const chapters = await LoadChapters({})
    // const c = addParentId(chapters)
    // if (c.length > 0) {
    //   set({ book, chapters: c })
    // }
    // else {
    //   const newChapter = {} as any
    //   set({ book, chapters: [newChapter] })
    // }
  },
  appendChapter: (id, chap) => {
    const newId = Math.random()
    set(state => {
      // const target = findChapterById(state.chapters, id)
      // if (target === undefined)
      //   throw new Error('chapter not found')

      // const parent = findChapterById(state.chapters, target.parentId)
      // const children = parent?.children ?? state.chapters
      // const index = children.indexOf(target)
      // const c = {} as any
      // const c2 = addParentId([c])
      // children.splice(index + 1, 0, c2[0])
    })
    return newId
  },
  removeChapter: id => {
    set(state => {
      // const target = findChapterById(state.chapters, id)
      // if (target === undefined)
      //   throw new Error('chapter not found')

      // const parent = findChapterById(state.chapters, target.parentId)
      // const children = parent?.children ?? state.chapters
      // if (children.length <= 1)
      //   return

      // const index = children.indexOf(target)
      // children.splice(index, 1)
    })
  },
  indentChapter: id => {
    set(state => {
      // const target = findChapterById(state.chapters, id)
      // if (target === undefined)
      //   throw new Error('chapter not found')

      // const parent = findChapterById(state.chapters, target.parentId)
      // const siblings = parent?.children ?? state.chapters
      // const index = siblings.findIndex(c => c.id === id)
      // if (index === 0)
      //   return
      // const bigBrother = siblings[index - 1]
      // bigBrother.children = bigBrother.children ?? []
      // bigBrother.children.push(target)
      // target.parentId = bigBrother.id
      // siblings.splice(index, 1)
    })
  },
  unindentChapter: id => {
    set(state => {
      // const target = findChapterById(state.chapters, id)
      // if (target === undefined)
      //   throw new Error('chapter not found')
      // if (target.parentId === undefined)
      //   return
      // const parent = findChapterById(state.chapters, target.parentId)
      // if (parent === undefined)
      //   throw new Error('chapter not found')
      // const siblings = parent.children
      // if (!siblings)
      //   return

      // const index = siblings.findIndex(c => c.id === id)
      // const parentSiblings
      //   = findChapterById(state.chapters, parent.parentId)?.children
      //   ?? state.chapters
      // const parentIndex = parentSiblings.findIndex(c => c.id === parent.id)
      // parentSiblings.splice(parentIndex + 1, 0, target)
      // siblings.splice(index, 1)
      // target.parentId = parent.parentId
    })
  },
}))

function findChapterById(chapters: Chapters, id?: number): Chapter | undefined {
  if (id === undefined)
    return undefined
  for (const chapter of chapters) {
    if (chapter.id === id)
      return chapter

    // if (chapter.children?.length > 0) {
    //   const c = findChapterById(chapter.children, id);
    //   if (c) return c;
    // }
  }
  return undefined
}

function addParentId(chapters: Chapters, parent?: Chapter): Chapters {
  // return chapters?.map(chap => ({
  //   ...chap,
  //   parentId: parent?.id,
  //   // children: addParentId(chap.children, chap),
  // }))
  return chapters
}

// useChapters.subscribe((state, prevState) => {
//   if (!state.book)
//     return
//   // SaveChapters(state.book, state.chapters);
// })

type Props = {
  chapters: Chapters
  path?: Path
  focused?: Chapter['id']
  onInput: (e: ChangeEvent<HTMLInputElement>, id: Chapter['id']) => void
  onSelect?: (e: FocusEvent<HTMLInputElement>, id: Chapter['id']) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>, id: Chapter['id']) => void
}
type Node = Omit<Chapter, 'convertValues'> & {
  children: Node[]
}
type Tree = Node[]
function findNodeById(tree: Tree, id: Chapter['id']): Node | undefined {
  for (const node of tree) {
    if (node.id === id)
      return node
    if (node.children?.length > 0) {
      const c = findNodeById(node.children, id)
      if (c)
        return c
    }
  }
  return undefined
}
function chapters2tree(chapters: Chapters): Tree {
  const tree: Tree = []
  for (const chapter of chapters) {
    const node: Node = { ...chapter, children: [] }
    if (chapter.parent_id) {
      const parent = findNodeById(tree, chapter.parent_id)
      if (parent) { parent.children.push(node) }
      else { throw new Error(`parent_id ${chapter.parent_id} 不存在`) }
    }
    else { tree.push(node) }
  }
  return tree
}
export const Chapters2: React.FC<Props> = props => {
  const { chapters, focused, path = [], onInput, onSelect, onKeyDown } = props
  const tree = chapters2tree(chapters)
  const x = (tree: Tree, path: Path) => <>
    {tree
      ? tree.map(node => [
      <MenuItem key={node.id ?? node.name} path={path} id={node.id} focused={focused}
        value={node.name} onKeyDown={onKeyDown} onInput={onInput} onSelect={onSelect} >
          {x(node.children, [...path, node.id])}
      </MenuItem>,
      ])
      : null}
  </>
  return x(tree, path)
}

const MenuItem: React.FC<MenuItemProps> = props => {
  const {
    id, path, children, hasChildren, focused, onInput, onSelect,
    onKeyDown, value,
  } = props
  const level = path.length
  const style = {
    paddingLeft: `${16 + level * 4}px`,
  }
  const [open, setOpen] = useState(true)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [focused])
  return (
    <div style={style} className="menuItem">
      <label py-4px flex items-center className="menuItem-name">
        {hasChildren
          ? open
            ? <i i-bi-chevron-down shrink-0 mr-4px
                onClick={() => setOpen(false)} />
            : <i i-bi-chevron-right shrink-0 mr-4px
                onClick={() => setOpen(true)} />
          : <i i-bi-record shrink-0 mr-4px />
            }
        <input
          ref={inputRef} lh-24px py-8px text-18px
          value={value} shrink-1
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => onKeyDown?.(e, id)}
          onInput={(e: ChangeEvent<HTMLInputElement>) => onInput(e, id)}
          onFocus={(e: FocusEvent<HTMLInputElement>) => onSelect?.(e, id)}
        />
      </label>
      <Collapse isOpened={open}>{children}</Collapse>
    </div>
  )
}
