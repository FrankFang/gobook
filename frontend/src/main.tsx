import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { modelsPatch } from './models-patch'
import { createRoutes } from './routes'
import '@unocss/reset/tailwind.css'
import './assets/stylesheets/global.css'
import 'virtual:uno.css'

window?.console.log(modelsPatch)

const container = document.getElementById('root')

const root = createRoot(container!)

const routes = createRoutes()

root.render(
  <React.StrictMode>
    <HashRouter>{routes}</HashRouter>
  </React.StrictMode>
)
