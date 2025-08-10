import React, { useState } from 'react'
import { Shield, CheckCircle, XCircle, Settings } from 'lucide-react'

const Firewall: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true)
  const [riskThreshold, setRiskThreshold] = useState(70)

  const blockedTransactions = [
    {
      id: '0x1234...5678',
      type: 'Token Approval',
      contract: '0xabcd...efgh',
      risk: 95,
      reason: '无限授权风险 - 可能导致资产被完全控制',
      timestamp: '2024-01-09 19:45:23',
      amount: 'Unlimited USDC'
    },
    {
      id: '0x2345...6789',
      type: 'Contract Interaction',
      contract: '0xbcde...fghi',
      risk: 88,
      reason: '未验证合约 - 可能存在恶意代码',
      timestamp: '2024-01-09 19:42:15',
      amount: '0.5 ETH'
    },
    {
      id: '0x3456...7890',
      type: 'NFT Transfer',
      contract: '0xcdef...ghij',
      risk: 75,
      reason: '高价值NFT转移 - 建议二次确认',
      timestamp: '2024-01-09 19:38:47',
      amount: 'Bored Ape #1234'
    }
  ]

  const allowedTransactions = [
    {
      id: '0x4567...8901',
      type: 'Token Swap',
      contract: '0xdef0...hijk',
      risk: 25,
      reason: '已验证的DEX合约，风险较低',
      timestamp: '2024-01-09 19:50:12',
      amount: '100 USDT → ETH'
    },
    {
      id: '0x5678...9012',
      type: 'Token Transfer',
      contract: '0xef01...ijkl',
      risk: 15,
      reason: '标准ERC-20转账，风险极低',
      timestamp: '2024-01-09 19:47:33',
      amount: '50 USDC'
    }
  ]

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'text-red-600 bg-red-100'
    if (risk >= 60) return 'text-orange-600 bg-orange-100'
    if (risk >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getRiskLevel = (risk: number) => {
    if (risk >= 80) return 'CRITICAL'
    if (risk >= 60) return 'HIGH'
    if (risk >= 40) return 'MEDIUM'
    return 'LOW'
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">链上行为防火墙</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">实时监控和拦截高风险Web3交易</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">防火墙状态:</span>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isEnabled ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {isEnabled ? '已启用' : '已禁用'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEnabled 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isEnabled ? '禁用防火墙' : '启用防火墙'}
          </button>
        </div>
      </div>

      {/* 防火墙设置 */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">防火墙设置</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              风险阈值: {riskThreshold}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>低风险</span>
              <span>中风险</span>
              <span>高风险</span>
              <span>极高风险</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              风险评分超过 {riskThreshold}% 的交易将被自动拦截
            </p>
          </div>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">今日拦截</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">127</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">今日通过</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,543</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">拦截率</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">7.6%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 被拦截的交易 */}
      <div className="card">
        <div className="flex items-center mb-4">
          <XCircle className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">被拦截的交易</h3>
        </div>
        
        <div className="space-y-4">
          {blockedTransactions.map((tx) => (
            <div key={tx.id} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{tx.id}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(tx.risk)}`}>
                    {getRiskLevel(tx.risk)} ({tx.risk}%)
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{tx.timestamp}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">类型:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{tx.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">合约:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">{tx.contract}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">金额:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{tx.amount}</span>
                </div>
              </div>
              
              <div className="mt-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">拦截原因:</span>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{tx.reason}</p>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button className="btn-danger text-xs">
                  永久拦截
                </button>
                <button className="btn-secondary text-xs">
                  允许一次
                </button>
                <button className="btn-secondary text-xs">
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 已通过的交易 */}
      <div className="card">
        <div className="flex items-center mb-4">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">已通过的交易</h3>
        </div>
        
        <div className="space-y-4">
          {allowedTransactions.map((tx) => (
            <div key={tx.id} className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{tx.id}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(tx.risk)}`}>
                    {getRiskLevel(tx.risk)} ({tx.risk}%)
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{tx.timestamp}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">类型:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{tx.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">合约:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">{tx.contract}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">金额:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{tx.amount}</span>
                </div>
              </div>
              
              <div className="mt-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">通过原因:</span>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{tx.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Firewall