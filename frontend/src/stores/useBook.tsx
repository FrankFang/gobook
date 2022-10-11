import create from 'zustand'
import {
  subscribeWithSelector,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { main } from '../../wailsjs/go/models'
import { DeleteChapter, GetBookWithChapters, InsertChapterAfter, MoveChapter, UpdateChapter } from '../../wailsjs/go/main/App'

type Node = Omit<Chapter, 'convertValues'> & { children: Node[]; level: number }
type Tree = Node[]

const moveTypeMap = {
  insertAfter: 0,
  insertBefore: 1,
  append: 2
}
interface State {
  book?: main.Book
  chapters: main.Chapter[]
  tree: Tree
  flatTree: Tree
  fetchBook: (id?: number) => void
  updateLocalChapter: (id: number, attrs: Partial<Omit<Chapter, 'id'>>) => void
  updateRemoteChapter: (id: number, attrs: Partial<Omit<Chapter, 'id'>>) => void
  appendChapter: (id: number, attrs: Partial<Omit<Chapter, 'id'>>) => Promise<Chapter>
  deleteChapter: (id: number) => Promise<void>
  findSiblingsInTree: (id: number, tree: Tree) => Node[]
  findOlderBrotherInTree: (id: number, tree: Tree) => Node | undefined
  findYoungerBrotherInTree: (id: number, tree: Tree) => Node | undefined
  findFatherInTree: (id: number, tree: Tree) => Node | undefined
  findChildrenInTree: (id: number, tree: Tree) => Node[]
  findSelfInTree: (id: number, tree: Tree) => Node | undefined
  moveChapter: (moveType: keyof typeof moveTypeMap, chapterId: number, targetId: number) => void
}

export const useBook = create<State>()(
  subscribeWithSelector(
    immer(
      (set, get) => ({
        book: undefined,
        chapters: [],
        tree: [],
        flatTree: [],
        fetchBook: async id => {
          if (id === undefined) { return }
          const bwc = await GetBookWithChapters(id)
          const { chapters, ...rest } = bwc
          set(state => {
            // Object.assign(state, { book: new main.Book(rest), chapters })
            state.book = new main.Book(rest)
            state.chapters = chapters
          })
        },
        updateLocalChapter(id, attrs) {
          set(state => {
            const chapter = state.chapters.find(c => c.id === id)!
            Object.assign(chapter, attrs)
          })
        },
        updateRemoteChapter: async (id, attrs) => {
          const patch = Object.assign({}, get().chapters.find(c => c.id === id), attrs)
          const newC = await UpdateChapter({ ...patch, id })
          set(state => {
            const chapter = state.chapters.find(c => c.id === id)!
            Object.assign(chapter, newC)
          })
        },
        appendChapter: async (id, attrs) => {
          const chapter = await InsertChapterAfter(id, attrs)
          set(state => {
            state.chapters.push(chapter)
          })
          return chapter
        },
        deleteChapter: async id => {
          await DeleteChapter(id)
          set(state => {
            const index = state.chapters.findIndex(c => c.id === id)
            state.chapters.splice(index, 1)
          })
        },
        findSiblingsInTree: (chapterId, tree) => {
          const currentNode = findNodeById(tree, chapterId)
          if (!currentNode) { throw new Error('chapter is not found') }
          let children = []
          if (currentNode.parent_id) {
            const parent = findNodeById(tree, currentNode.parent_id)
            if (!parent) { throw new Error('parent not found') }
            children = parent.children ?? []
          } else {
            children = tree
          }
          return children
        },
        findOlderBrotherInTree: (chapterId, tree) => {
          const children = get().findSiblingsInTree(chapterId, tree)
          const currentIndex = children.findIndex(c => c.id === chapterId)
          return children[currentIndex - 1]
        },
        findYoungerBrotherInTree: (chapterId, tree) => {
          const children = get().findSiblingsInTree(chapterId, tree)
          const currentIndex = children.findIndex(c => c.id === chapterId)
          return children[currentIndex + 1]
        },
        findFatherInTree: (id, tree) => {
          const currentNode = findNodeById(tree, id)
          if (!currentNode) { throw new Error('chapter is not found') }
          if (!currentNode.parent_id) { return undefined }
          return findNodeById(tree, currentNode.parent_id)
        },
        findChildrenInTree: (id, tree) => {
          const currentNode = findNodeById(tree, id)
          if (!currentNode) { throw new Error('chapter is not found') }
          return currentNode.children
        },
        findSelfInTree: (id, tree) => {
          return findNodeById(tree, id)
        },
        moveChapter: async (type, chapterId, targetId) => {
          const newChapter = await MoveChapter(moveTypeMap[type], chapterId, targetId)
          set(state => {
            const chapter = state.chapters.find(c => c.id === chapterId)!
            Object.assign(chapter, newChapter)
          })
        }
      } as State)
    )
  )
)

// 只要 chapters 改变，就重新生成 tree
useBook.subscribe(
  state => state.chapters,
  chapters => {
    const state = useBook.getState()
    const tree = generateChapterTree(chapters)
    const flatTree = flattenTree(tree)
    useBook.setState({ ...state, tree, flatTree })
  }
)
function flattenTree(tree: Tree) {
  const result: Tree = []
  const flatten = (tree: Tree) => {
    for (const node of tree) {
      result.push(node)
      if (node.children) { flatten(node.children) }
    }
  }
  flatten(tree)
  return result
}
function generateChapterTree(chapters: Chapter[]): Tree {
  const tree: Node[] = []
  const parentIdList = chapters.map(c => c.parent_id)
  const clone: typeof chapters = JSON.parse(JSON.stringify(chapters))
  for (let i = 0; clone[i]; i++) {
    const chapter = clone[i]
    const node: Node = { children: [], level: 1, ...chapter }
    if (node.parent_id) {
      if (!parentIdList.includes(node.parent_id)) { continue }
      const parent = findNodeById(tree, node.parent_id)
      if (parent) {
        insertNode(parent.children, node)
        node.level = parent.level + 1
      } else {
        clone.push(chapter)
      }
    } else {
      insertNode(tree, node)
    }
  }
  return tree
}
function insertNode(array: Node[], node: Node) {
  const index = array.findIndex(c => c.sequence! > node.sequence!)
  const insertPosition = index >= 0 ? index : array.length
  array.splice(insertPosition, 0, node)
}

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
