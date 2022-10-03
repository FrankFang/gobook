import React, {useState} from 'react'
import { Outlet } from 'react-router-dom'

export const App: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}
