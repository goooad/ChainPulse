import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Firewall from './pages/Firewall'
import NFTSentiment from './pages/NFTSentiment'
import AddressAnalysis from './pages/AddressAnalysis'
import Settings from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/firewall" element={<Firewall />} />
        <Route path="/nft-sentiment" element={<NFTSentiment />} />
        <Route path="/address-analysis" element={<AddressAnalysis />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App