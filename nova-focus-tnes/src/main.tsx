
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const Root = () => {
  const [tab, setTab] = useState('Now')
  return <App />
}

createRoot(document.getElementById('root')!).render(<Root />)
