import React from 'react'
import { TrendingUp, TrendingDown, Eye, Search, Clock, DollarSign } from 'lucide-react'

const Dashboard: React.FC = () => {
  // Mock数据 - 热门NFT分析
  const hotNFTs = [
    {
      id: 1,
      name: 'Bored Ape Yacht Club',
      symbol: 'BAYC',
      sentiment: 'positive',
      score: 85,
      searches: 1247,
      change: '+12.5%',
      lastAnalyzed: '2分钟前'
    },
    {
      id: 2,
      name: 'CryptoPunks',
      symbol: 'PUNKS',
      sentiment: 'neutral',
      score: 72,
      searches: 892,
      change: '+3.2%',
      lastAnalyzed: '5分钟前'
    },
    {
      id: 3,
      name: 'Azuki',
      symbol: 'AZUKI',
      sentiment: 'positive',
      score: 78,
      searches: 634,
      change: '+8.7%',
      lastAnalyzed: '1分钟前'
    },
    {
      id: 4,
      name: 'Pudgy Penguins',
      symbol: 'PPG',
      sentiment: 'negative',
      score: 45,
      searches: 523,
      change: '-5.3%',
      lastAnalyzed: '3分钟前'
    },
    {
      id: 5,
      name: 'Doodles',
      symbol: 'DOODLES',
      sentiment: 'positive',
      score: 81,
      searches: 467,
      change: '+15.2%',
      lastAnalyzed: '4分钟前'
    }
  ]

  // Mock数据 - 热门地址查询
  const hotAddresses = [
    {
      id: 1,
      address: '0x1234...5678',
      label: 'Whale Wallet #1',
      searches: 342,
      ethBalance: '1,247.5',
      usdtBalance: '125,000',
      lastQueried: '1分钟前',
      riskLevel: 'low'
    },
    {
      id: 2,
      address: '0xabcd...efgh',
      label: 'DeFi Protocol',
      searches: 289,
      ethBalance: '892.3',
      usdtBalance: '89,200',
      lastQueried: '3分钟前',
      riskLevel: 'medium'
    },
    {
      id: 3,
      address: '0x9876...4321',
      label: 'NFT Trader',
      searches: 234,
      ethBalance: '456.7',
      usdtBalance: '45,600',
      lastQueried: '2分钟前',
      riskLevel: 'low'
    },
    {
      id: 4,
      address: '0xfedc...ba98',
      label: 'Exchange Hot Wallet',
      searches: 198,
      ethBalance: '2,345.8',
      usdtBalance: '234,500',
      lastQueried: '5分钟前',
      riskLevel: 'high'
    },
    {
      id: 5,
      address: '0x5555...aaaa',
      label: 'Smart Contract',
      searches: 167,
      ethBalance: '123.4',
      usdtBalance: '12,300',
      lastQueried: '4分钟前',
      riskLevel: 'medium'
    }
  ]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">数据仪表盘</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            实时展示用户搜索的热门NFT分析和地址查询数据
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>实时更新中</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">NFT分析总数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3,763</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">地址查询总数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,230</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">今日活跃用户</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">456</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">平均响应时间</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1.2s</p>
            </div>
          </div>
        </div>
      </div>

      {/* 热门NFT分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            热门NFT情绪分析
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            基于用户搜索频次和情绪分析结果排序
          </p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="pb-3">NFT项目</th>
                  <th className="pb-3">情绪</th>
                  <th className="pb-3">分数</th>
                  <th className="pb-3">搜索次数</th>
                  <th className="pb-3">变化</th>
                  <th className="pb-3">最后分析</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {hotNFTs.map((nft, index) => (
                  <tr key={nft.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{nft.name}</div>
                          <div className="text-sm text-gray-500">{nft.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(nft.sentiment)}`}>
                        {nft.sentiment === 'positive' ? '积极' : nft.sentiment === 'negative' ? '消极' : '中性'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${nft.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{nft.score}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-900 dark:text-white font-medium">{nft.searches}</td>
                    <td className="py-3">
                      <span className={`flex items-center text-sm font-medium ${
                        nft.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {nft.change.startsWith('+') ? 
                          <TrendingUp className="h-4 w-4 mr-1" /> : 
                          <TrendingDown className="h-4 w-4 mr-1" />
                        }
                        {nft.change}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">{nft.lastAnalyzed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 热门地址查询 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Search className="h-5 w-5 mr-2 text-green-600" />
            热门地址查询
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            基于用户查询频次和资产规模排序
          </p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="pb-3">地址</th>
                  <th className="pb-3">ETH余额</th>
                  <th className="pb-3">USDT余额</th>
                  <th className="pb-3">查询次数</th>
                  <th className="pb-3">风险等级</th>
                  <th className="pb-3">最后查询</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {hotAddresses.map((addr, index) => (
                  <tr key={addr.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-mono text-sm text-gray-900 dark:text-white">{addr.address}</div>
                          <div className="text-xs text-gray-500">{addr.label}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="font-medium text-gray-900 dark:text-white">{addr.ethBalance} ETH</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-medium text-gray-900 dark:text-white">${addr.usdtBalance}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-900 dark:text-white font-medium">{addr.searches}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(addr.riskLevel)}`}>
                        {addr.riskLevel === 'low' ? '低风险' : addr.riskLevel === 'high' ? '高风险' : '中风险'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">{addr.lastQueried}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard