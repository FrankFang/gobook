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
export type ChapterListItemProps = {
  value: string
  path: Path
  id: Chapter['id']
  hasChildren: boolean
  children?: ReactNode
} & Omit<TraverseParams, 'tree'>

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

export const useChapters = createStore<Store>(set => ({
  book: undefined,
  chapters: [],
  updateChapter: (id: Chapter['id'], name: Chapter['name']) => {
    throw new Error('not implemented')
  },
  fetchChapters: async () => {
    throw new Error('not implemented')
  },
  appendChapter: () => {
    throw new Error('not implemented')
  },
  removeChapter: () => {
    throw new Error('not implemented')
  },
  indentChapter: () => {
    throw new Error('not implemented')
  },
  unindentChapter: () => {
    throw new Error('not implemented')
  },
}))

