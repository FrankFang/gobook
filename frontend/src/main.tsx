import React from 'react'
import { createRoot } from 'react-dom/client'
import '@unocss/reset/tailwind.css'
import './assets/stylesheets/global.css'
import 'virtual:uno.css'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { createRoutes } from './routes'

const container = document.getElementById('root')

const root = createRoot(container!)

const routes = createRoutes()

root.render(
  <React.StrictMode>
    <HashRouter>{routes}</HashRouter>
  </React.StrictMode>
)
