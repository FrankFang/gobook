import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react'
import type { main } from '../../../wailsjs/go/models'
import { ChapterListItem } from './ChapterListItem'
type Chapter = main.Chapter
type Chapters = Chapter[]
type Node = Omit<Chapter, 'convertValues'> & { children: Node[] }
type Tree = Node[]

export type ChapterListProps = {
  chapters: Chapter[]
  path?: Path
  focused?: Chapter['id']
  onInput: (e: ChangeEvent<HTMLInputElement>, id: Chapter['id']) => void
  onSelect?: (e: FocusEvent<HTMLInputElement>, id: Chapter['id']) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>, id: Chapter['id']) => void
  onDebouncedChange?: (id: Chapter['id'], name: Chapter['name']) => void
}

export const ChapterList: React.FC<ChapterListProps> = props => {
  const { chapters, path = [], ...rest } = props
  const tree = chapters2tree(chapters)
  const renderChapters = (tree: Tree, path: Path) => <>
    {tree
      ? tree.map(node => [
        <ChapterListItem key={node.id ?? node.name} path={path} id={node.id}
          hasChildren={node.children?.length > 0} value={node.name} {...rest} >
            {renderChapters(node.children, [...path, node.id])}
        </ChapterListItem>
      ])
      : null}
  </>
  return renderChapters(tree, path)
}

// helpers
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
