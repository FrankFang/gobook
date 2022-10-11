import { Outlet, Route, Routes } from 'react-router-dom'
import { BookEdit } from '../views/BookEdit/BookEdit'
import { Empty } from '../views/Empty'
import { Home } from '../views/Home/Home'
import { NoSelectedChapter } from '../components/NoSelectedChapter'
import { ChapterEdit } from '../views/ChapterEdit'
import { Publish } from '../views/Publish'
export const createRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<Home />} />
        <Route path="books" element={<Outlet />}>
          <Route index element={<Empty />} />
          <Route path=":bookId" element={<Outlet />}>
            <Route index element={<Empty />} />
            <Route path="publish" element={<Publish />} />
            <Route path="edit" element={<BookEdit />}>
              <Route index element={<NoSelectedChapter />} />
              <Route path="chapters" element={<Outlet />}>
                <Route index element={<Empty />} />
                <Route path=":chapterId" element={<Outlet />}>
                  <Route index element={<Empty />} />
                  <Route path="edit" element={<ChapterEdit />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
