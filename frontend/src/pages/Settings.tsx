import React, { useState } from 'react'
import { Settings as SettingsIcon, Shield, Bell, Palette, Key } from 'lucide-react'
import ConfigStatus from '../components/ConfigStatus'

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    // 安全设置
    riskTolerance: 'MODERATE',
    autoBlock: true,
    requireConfirmation: true,
    
    // 功能开关
    transactionFirewall: true,
    nftSentiment: true,
    priceMonitoring: true,
    
    // 通知设置
    highRiskTransactions: true,
    sentimentAlerts: true,
    priceAlerts: true,
    emailNotifications: false,
    
    // API设置
    claudeApiKey: '',
    twitterApiKey: '',
    ethereumRpcUrl: 'https://mainnet.infura.io/v3/your-key',
    
    // 界面设置
    theme: 'system',
    language: 'zh-CN'
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = () => {
    // 这里应该调用API保存设置
    console.log('保存设置:', settings)
    alert('设置已保存！')
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">设置</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">配置Web3Sentry的各项功能和参数</p>
      </div>

      {/* 配置状态显示 */}
      <ConfigStatus />

      {/* 安全设置 */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">安全设置</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              风险容忍度
            </label>
            <select
              value={settings.riskTolerance}
              onChange={(e) => handleSettingChange('riskTolerance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="CONSERVATIVE">保守 - 拦截所有中等风险以上的交易</option>
              <option value="MODERATE">适中 - 拦截高风险交易</option>
              <option value="AGGRESSIVE">激进 - 仅拦截极高风险交易</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                自动拦截高风险交易
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                启用后将自动拦截超过风险阈值的交易
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBlock}
                onChange={(e) => handleSettingChange('autoBlock', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                交易前需要确认
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                每笔交易都需要用户手动确认
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireConfirmation}
                onChange={(e) => handleSettingChange('requireConfirmation', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 功能开关 */}
      <div className="card">
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">功能开关</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                链上行为防火墙
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                实时监控和拦截高风险交易
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.transactionFirewall}
                onChange={(e) => handleSettingChange('transactionFirewall', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                NFT情绪预测
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                基于AI的多平台情绪分析
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.nftSentiment}
                onChange={(e) => handleSettingChange('nftSentiment', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                价格监控
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                主流币种波动监控与预测
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.priceMonitoring}
                onChange={(e) => handleSettingChange('priceMonitoring', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">通知设置</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                高风险交易通知
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                检测到高风险交易时发送通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highRiskTransactions}
                onChange={(e) => handleSettingChange('highRiskTransactions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                情绪变化通知
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                NFT市场情绪发生重大变化时通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sentimentAlerts}
                onChange={(e) => handleSettingChange('sentimentAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                价格预警通知
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                价格达到预设阈值时发送通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.priceAlerts}
                onChange={(e) => handleSettingChange('priceAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                邮件通知
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                通过邮件接收重要通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* API配置 */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Key className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API配置</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Claude API Key
            </label>
            <input
              type="password"
              value={settings.claudeApiKey}
              onChange={(e) => handleSettingChange('claudeApiKey', e.target.value)}
              placeholder="输入Claude API密钥"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              用于AI情绪分析和风险评估
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Twitter API Key
            </label>
            <input
              type="password"
              value={settings.twitterApiKey}
              onChange={(e) => handleSettingChange('twitterApiKey', e.target.value)}
              placeholder="输入Twitter API密钥"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              用于获取Twitter上的NFT讨论数据
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ethereum RPC URL
            </label>
            <input
              type="text"
              value={settings.ethereumRpcUrl}
              onChange={(e) => handleSettingChange('ethereumRpcUrl', e.target.value)}
              placeholder="输入以太坊RPC节点地址"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              用于连接以太坊网络获取链上数据
            </p>
          </div>
        </div>
      </div>

      {/* 界面设置 */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Palette className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">界面设置</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              主题
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
              <option value="system">跟随系统</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              语言
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end space-x-4">
        <button className="btn-secondary">
          重置为默认
        </button>
        <button className="btn-primary" onClick={saveSettings}>
          保存设置
        </button>
      </div>
    </div>
  )
}

export default Settings