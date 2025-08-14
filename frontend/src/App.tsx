import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NFTSentiment from './pages/NFTSentiment'
import AddressAnalysis from './pages/AddressAnalysis'
import Settings from './pages/Settings'
import './index.css'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nft-sentiment" element={<NFTSentiment />} />
          <Route path="/address-analysis" element={<AddressAnalysis />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App
