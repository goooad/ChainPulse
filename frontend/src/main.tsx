import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 忽略MetaMask相关的错误，因为我们不需要连接钱包
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('MetaMask') || 
      event.reason?.message?.includes('ethereum') ||
      event.reason?.message?.includes('wallet')) {
    console.warn('忽略钱包连接错误:', event.reason.message)
    event.preventDefault() // 阻止错误显示在控制台
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
