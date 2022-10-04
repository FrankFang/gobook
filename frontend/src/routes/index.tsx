import { Outlet, Route, Routes } from 'react-router-dom'
import { App } from '../App'
import { ChapterEdit } from '../views/ChapterEdit'
import { BookEdit } from '../views/BookEdit'
import { Empty } from '../views/Empty'
import { Home } from '../views/home/Home'
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
