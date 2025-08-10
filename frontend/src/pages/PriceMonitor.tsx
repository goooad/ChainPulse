import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Bell, Plus, Minus } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const PriceMonitor: React.FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('ETH')

  // 模拟价格数据
  const cryptoData = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2456.78,
      change24h: 5.67,
      volume24h: '12.5B',
      marketCap: '295.2B',
      prediction: {
        nextHour: 2478.32,
        next24h: 2523.45,
        confidence: 0.78
      },
      volatilityIndex: 65,
      riskLevel: 'MEDIUM' as const
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 43256.89,
      change24h: -2.34,
      volume24h: '18.7B',
      marketCap: '847.3B',
      prediction: {
        nextHour: 43189.45,
        next24h: 42987.23,
        confidence: 0.82
      },
      volatilityIndex: 45,
      riskLevel: 'LOW' as const
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.0002,
      change24h: 0.01,
      volume24h: '3.2B',
      marketCap: '52.1B',
      prediction: {
        nextHour: 1.0001,
        next24h: 1.0003,
        confidence: 0.95
      },
      volatilityIndex: 5,
      riskLevel: 'LOW' as const
    }
  ]

  // 价格历史数据
  const priceHistory = [
    { time: '00:00', ETH: 2420, BTC: 43500, USDC: 1.0001 },
    { time: '04:00', ETH: 2435, BTC: 43320, USDC: 1.0002 },
    { time: '08:00', ETH: 2448, BTC: 43180, USDC: 1.0001 },
    { time: '12:00', ETH: 2462, BTC: 43050, USDC: 1.0003 },
    { time: '16:00', ETH: 2451, BTC: 43200, USDC: 1.0002 },
    { time: '20:00', ETH: 2457, BTC: 43257, USDC: 1.0002 },
  ]

  // 价格预警设置
  const [alerts, setAlerts] = useState([
    { id: 1, symbol: 'ETH', type: 'above', price: 2500, active: true },
    { id: 2, symbol: 'BTC', type: 'below', price: 42000, active: true },
    { id: 3, symbol: 'ETH', type: 'volatility', threshold: 10, active: false }
  ])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'HIGH': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'USDC') {
      return `$${price.toFixed(4)}`
    }
    return `$${price.toLocaleString()}`
  }

  const selectedCryptoData = cryptoData.find(crypto => crypto.symbol === selectedCrypto)

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">价格监控</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">主流币种波动监控与AI价格预测</p>
      </div>

      {/* 加密货币概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cryptoData.map((crypto) => (
          <div key={crypto.symbol} className="card cursor-pointer hover:shadow-lg transition-shadow"
               onClick={() => setSelectedCrypto(crypto.symbol)}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{crypto.symbol}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{crypto.name}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(crypto.riskLevel)}`}>
                {crypto.riskLevel}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(crypto.price, crypto.symbol)}
                </span>
                <div className={`flex items-center space-x-1 ${getChangeColor(crypto.change24h)}`}>
                  {getChangeIcon(crypto.change24h)}
                  <span className="text-sm font-medium">
                    {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">24h交易量</span>
                  <p className="font-medium text-gray-900 dark:text-white">{crypto.volume24h}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">市值</span>
                  <p className="font-medium text-gray-900 dark:text-white">{crypto.marketCap}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300">波动指数</span>
                  <span className="font-medium text-gray-900 dark:text-white">{crypto.volatilityIndex}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${crypto.volatilityIndex}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 价格图表 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">价格走势</h3>
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {cryptoData.map((crypto) => (
              <option key={crypto.symbol} value={crypto.symbol}>
                {crypto.symbol} - {crypto.name}
              </option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={priceHistory}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [formatPrice(Number(value), selectedCrypto), selectedCrypto]}
            />
            <Area 
              type="monotone" 
              dataKey={selectedCrypto} 
              stroke="#3B82F6" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI价格预测 */}
      {selectedCryptoData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI价格预测</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">当前价格</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(selectedCryptoData.price, selectedCrypto)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">1小时预测</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(selectedCryptoData.prediction.nextHour, selectedCrypto)}
              </p>
              <p className={`text-sm ${getChangeColor(selectedCryptoData.prediction.nextHour - selectedCryptoData.price)}`}>
                {selectedCryptoData.prediction.nextHour >= selectedCryptoData.price ? '+' : ''}
                {((selectedCryptoData.prediction.nextHour - selectedCryptoData.price) / selectedCryptoData.price * 100).toFixed(2)}%
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">24小时预测</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(selectedCryptoData.prediction.next24h, selectedCrypto)}
              </p>
              <p className={`text-sm ${getChangeColor(selectedCryptoData.prediction.next24h - selectedCryptoData.price)}`}>
                {selectedCryptoData.prediction.next24h >= selectedCryptoData.price ? '+' : ''}
                {((selectedCryptoData.prediction.next24h - selectedCryptoData.price) / selectedCryptoData.price * 100).toFixed(2)}%
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">预测置信度</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {(selectedCryptoData.prediction.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${selectedCryptoData.prediction.confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* 价格预警设置 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">价格预警</h3>
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            添加预警
          </button>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${alert.active ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-200 dark:bg-gray-600'}`}>
                  <Bell className={`h-4 w-4 ${alert.active ? 'text-green-600 dark:text-green-300' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.symbol} 价格 {alert.type === 'above' ? '高于' : alert.type === 'below' ? '低于' : '波动超过'} 
                    {alert.type === 'volatility' ? ` ${alert.threshold}%` : ` $${alert.price}`}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    状态: {alert.active ? '已启用' : '已禁用'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className={`px-3 py-1 text-xs rounded-lg ${
                    alert.active 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  onClick={() => {
                    setAlerts(alerts.map(a => 
                      a.id === alert.id ? { ...a, active: !a.active } : a
                    ))
                  }}
                >
                  {alert.active ? '禁用' : '启用'}
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PriceMonitor