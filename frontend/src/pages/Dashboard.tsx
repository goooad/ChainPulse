import React, { useState } from 'react'
import { Shield, TrendingUp, Heart, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard: React.FC = () => {
  const [stats] = useState({
    blockedTransactions: 127,
    riskAssessments: 1543,
    nftSentiments: 89,
    priceAlerts: 23
  })

  // 模拟数据
  const riskData = [
    { name: '00:00', low: 45, medium: 25, high: 15, critical: 5 },
    { name: '04:00', low: 52, medium: 28, high: 12, critical: 3 },
    { name: '08:00', low: 38, medium: 35, high: 20, critical: 7 },
    { name: '12:00', low: 41, medium: 32, high: 18, critical: 9 },
    { name: '16:00', low: 47, medium: 29, high: 16, critical: 8 },
    { name: '20:00', low: 43, medium: 31, high: 19, critical: 7 },
  ]

  const sentimentData = [
    { name: 'BULLISH', value: 45, color: '#10B981' },
    { name: 'BEARISH', value: 30, color: '#EF4444' },
    { name: 'NEUTRAL', value: 25, color: '#6B7280' },
  ]

  const recentTransactions = [
    {
      id: '0x1234...5678',
      type: 'Transfer',
      risk: 'LOW',
      amount: '0.5 ETH',
      status: 'blocked',
      time: '2分钟前'
    },
    {
      id: '0x2345...6789',
      type: 'Approve',
      risk: 'HIGH',
      amount: 'Unlimited USDC',
      status: 'blocked',
      time: '5分钟前'
    },
    {
      id: '0x3456...7890',
      type: 'Swap',
      risk: 'MEDIUM',
      amount: '100 USDT',
      status: 'allowed',
      time: '8分钟前'
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-orange-600 bg-orange-100'
      case 'CRITICAL': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    return status === 'blocked' ? 
      <XCircle className="h-4 w-4 text-red-500" /> : 
      <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">仪表板</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Web3安全防护与智能投顾概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">已拦截交易</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.blockedTransactions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">风险评估</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.riskAssessments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">NFT情绪分析</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.nftSentiments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">价格预警</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.priceAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 风险趋势图 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">24小时风险趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="low" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="high" stroke="#F97316" strokeWidth={2} />
              <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* NFT情绪分布 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">NFT市场情绪</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近交易 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近交易监控</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  交易哈希
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  风险等级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                    {tx.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {tx.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(tx.risk)}`}>
                      {tx.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {tx.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(tx.status)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                        {tx.status === 'blocked' ? '已拦截' : '已允许'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {tx.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard