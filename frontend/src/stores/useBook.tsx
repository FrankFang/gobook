import create from 'zustand'
import {
  subscribeWithSelector,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { main } from '../../wailsjs/go/models'
import { GetBookWithChapters, InsertChapterAfter, MoveChapter, UpdateChapter } from '../../wailsjs/go/main/App'

type Node = Omit<Chapter, 'convertValues'> & { children: Node[] }
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
  fetchBook: (id?: number) => void
  updateLocalChapter: (id: number, attrs: Partial<Omit<Chapter, 'id'>>) => void
  updateRemoteChapter: (id: number, attrs: Partial<Omit<Chapter, 'id'>>) => void
  appendChapter: (id: number, attrs: Partial<Omit<Chapter, 'id'>>) => void
  findSiblings: (id: number, tree: Tree) => Node[]
  findOlderBrother: (id: number, tree: Tree) => Node | undefined
  findYoungerBrother: (id: number, tree: Tree) => Node | undefined
  findFather: (id: number, tree: Tree) => Node | undefined
  generateChapterTree: (chapters: Chapter[]) => Tree
  moveChapter: (moveType: keyof typeof moveTypeMap, chapterId: number, targetId: number) => void
}

export const useBook = create<State>()(
  subscribeWithSelector(
    immer(
      (set, get) => ({
        book: undefined,
        chapters: [],
        tree: [],
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
        },
        findSiblings: (chapterId, tree) => {
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
        findOlderBrother: (chapterId, tree) => {
          const children = get().findSiblings(chapterId, tree)
          const currentIndex = children.findIndex(c => c.id === chapterId)
          return children[currentIndex - 1]
        },
        findYoungerBrother: (chapterId, tree) => {
          const children = get().findSiblings(chapterId, tree)
          const currentIndex = children.findIndex(c => c.id === chapterId)
          return children[currentIndex + 1]
        },
        findFather: (id, tree) => {
          const currentNode = findNodeById(tree, id)
          if (!currentNode) { throw new Error('chapter is not found') }
          if (!currentNode.parent_id) { return undefined }
          return findNodeById(tree, currentNode.parent_id)
        },
        generateChapterTree: chapters => {
          const tree: Tree = []
          for (const chapter of chapters) {
            const copy = JSON.parse(JSON.stringify(chapter))
            const node: Node = { ...copy, children: [], parent: null }
            if (copy.parent_id) {
              const parent = findNodeById(tree, copy.parent_id)
              if (parent) { insertNode(parent.children, node, parent) }
            } else {
              insertNode(tree, node)
            }
          }
          return tree
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
    const tree = state.generateChapterTree(chapters)
    useBook.setState({ ...state, tree })
  }
)

function insertNode(array: Node[], node: Node, parent?: Node) {
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
