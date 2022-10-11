import * as React from 'react'
import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'
import { Link, Outlet } from 'react-router-dom'
import logo from '../assets/icons/logo.svg'
import { Button } from './Button'
type Props = {
  panels: ReactNode
  main: ReactNode
}
export const Layout: React.FC<Props> = ({ panels, main }) => {
  return (
    <div layout-wrapper>
      <aside layout-aside>
        <ol layout-panels>
          <li layout-panel>
            <Link to="/" m-4><Button color="white" size="small">返回首页</Button></Link>
          </li>
          {panels}
        </ol>
        <footer layout-footer>
          <img src={logo} h-8 shrink-0 /> <span text-3xl>GoBook</span>
        </footer>
      </aside>
      <main layout-main>
        {main}
      </main>
    </div>
  )
}
