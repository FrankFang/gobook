import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react'
import type { main } from '../../../wailsjs/go/models'
import { useBook } from '../../stores/useBook'
import { ChapterListItem } from './ChapterListItem'
type Chapter = main.Chapter
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
  const { tree } = useBook()
  const renderChapters = (tree: Tree, path: Path) => <>
    {tree
      ? tree.map(node =>
        <ChapterListItem key={node.id ?? node.name} path={path} id={node.id}
          hasChildren={node.children?.length > 0} value={node.name!} {...rest} >
            {renderChapters(node.children, [...path, node.id])}
        </ChapterListItem>
      )
      : null}
  </>
  return renderChapters(tree, path)
}

