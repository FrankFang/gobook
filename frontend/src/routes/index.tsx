import { Outlet, Route, Routes } from 'react-router-dom'
import { ChapterEdit } from '../views/ChapterEdit'
import { BookEdit } from '../views/BookEdit/BookEdit'
import { Empty } from '../views/Empty'
import { Home } from '../views/Home/Home'
export const createRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<Home />} />
        <Route path="books" element={<Outlet />}>
          <Route index element={<Empty />} />
          <Route path=":bookId" element={<Outlet />}>
            <Route index element={<Empty />} />
            <Route path="edit" element={<BookEdit />}>
              <Route path="articles" element={<Outlet />}>
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
