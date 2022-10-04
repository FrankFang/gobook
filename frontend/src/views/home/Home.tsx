import * as React from 'react'
import { useEffect } from 'react'
import logo from '../../assets/icons/logo.svg'
import { useBooks } from '../../stores/useBooks'

import { BookList } from './BookList'
import { BookForm } from './BookForm'
export const Home: React.FC = () => {
  const { listBooks } = useBooks()
  useEffect(() => {
    listBooks()
  }, [])
  return (
    <div h-screen flex font-sans overflow-hidden>
      <div shrink-0 b-1 p-8 flex flex-col justify-center gap-y-8>
        <div>
          <img w-218px src={logo} />
        </div>
        <header text-4xl>
          <h1>GoBook</h1>
          <h2>分享创造价值</h2>
        </header>
      </div>
      <div grow-1 b-1 bg-gray-250 gap-y-8 overflow-auto p-8>
        <BookForm />
        <BookList />
      </div>
    </div>
  )
}

