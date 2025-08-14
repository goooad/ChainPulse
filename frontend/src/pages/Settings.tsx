import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface SettingsState {
  general: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
    autoRefresh: boolean
    refreshInterval: number
  }
  nftSentiment: {
    enabled: boolean
    twitterAnalysis: boolean
    sentimentThreshold: number
    maxResults: number
    autoUpdate: boolean
  }
  addressAnalysis: {
    enabled: boolean
    showBalance: boolean
    showTransactions: boolean
    maxTransactions: number
    riskAnalysis: boolean
    realTimeUpdates: boolean
  }
  dashboard: {
    enabled: boolean
    showNFTStats: boolean
    showAddressStats: boolean
    refreshRate: number
    compactView: boolean
  }
}

const defaultSettings: SettingsState = {
  general: {
    theme: 'system',
    language: 'zh-CN',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 60
  },
  nftSentiment: {
    enabled: true,
    twitterAnalysis: true,
    sentimentThreshold: 0.5,
    maxResults: 50,
    autoUpdate: true
  },
  addressAnalysis: {
    enabled: true,
    showBalance: true,
    showTransactions: true,
    maxTransactions: 100,
    riskAnalysis: true,
    realTimeUpdates: false
  },
  dashboard: {
    enabled: true,
    showNFTStats: true,
    showAddressStats: true,
    refreshRate: 120,
    compactView: false
  }
}

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    const savedSettings = localStorage.getItem('web3-sentry-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  const updateSettings = (path: string, value: any) => {
    const keys = path.split('.')
    const newSettings = { ...settings }
    let current: any = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    setSettings(newSettings)
    saveSettings(newSettings)

    // 如果是主题设置，立即应用
    if (path === 'general.theme') {
      setTheme(value)
    }
  }

  const saveSettings = async (settingsToSave: SettingsState) => {
    setSaveStatus('saving')
    try {
      localStorage.setItem('web3-sentry-settings', JSON.stringify(settingsToSave))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    saveSettings(defaultSettings)
    setTheme('system')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">设置</h1>
              <div className="flex items-center space-x-4">
                {saveStatus === 'saving' && (
                  <span className="text-sm text-blue-600 dark:text-blue-400">保存中...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-sm text-green-600 dark:text-green-400">已保存</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-sm text-red-600 dark:text-red-400">保存失败</span>
                )}
                <button
                  onClick={resetSettings}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  重置设置
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* 通用设置 */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">通用设置</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  主题模式
                </label>
                <select
                  value={settings.general.theme}
                  onChange={(e) => updateSettings('general.theme', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="light">浅色模式</option>
                  <option value="dark">深色模式</option>
                  <option value="system">跟随系统</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  语言
                </label>
                <select
                  value={settings.general.language}
                  onChange={(e) => updateSettings('general.language', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">启用通知</div>
                  <div className="text-xs text-gray-500">接收系统通知和提醒</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.general.notifications}
                    onChange={(e) => updateSettings('general.notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">自动刷新</div>
                  <div className="text-xs text-gray-500">自动刷新数据</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.general.autoRefresh}
                    onChange={(e) => updateSettings('general.autoRefresh', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.general.autoRefresh && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    刷新间隔 ({settings.general.refreshInterval}秒)
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="30"
                    value={settings.general.refreshInterval}
                    onChange={(e) => updateSettings('general.refreshInterval', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30秒</span>
                    <span>5分钟</span>
                  </div>
                </div>
              )}
            </div>

            {/* NFT情绪分析设置 */}
            <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">NFT情绪分析</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">启用NFT情绪分析</div>
                  <div className="text-xs text-gray-500">分析NFT相关的社交媒体情绪</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.nftSentiment.enabled}
                    onChange={(e) => updateSettings('nftSentiment.enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.nftSentiment.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter分析</div>
                      <div className="text-xs text-gray-500">包含Twitter数据分析</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.nftSentiment.twitterAnalysis}
                        onChange={(e) => updateSettings('nftSentiment.twitterAnalysis', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      情绪阈值 ({settings.nftSentiment.sentimentThreshold})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.nftSentiment.sentimentThreshold}
                      onChange={(e) => updateSettings('nftSentiment.sentimentThreshold', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>负面</span>
                      <span>正面</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      最大结果数
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={settings.nftSentiment.maxResults}
                      onChange={(e) => updateSettings('nftSentiment.maxResults', parseInt(e.target.value))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">自动更新</div>
                      <div className="text-xs text-gray-500">定期自动更新分析结果</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.nftSentiment.autoUpdate}
                        onChange={(e) => updateSettings('nftSentiment.autoUpdate', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* 地址分析设置 */}
            <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">地址分析</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">启用地址分析</div>
                  <div className="text-xs text-gray-500">分析以太坊地址的交易和行为</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.addressAnalysis.enabled}
                    onChange={(e) => updateSettings('addressAnalysis.enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.addressAnalysis.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">显示余额</div>
                      <div className="text-xs text-gray-500">显示地址的ETH和代币余额</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.addressAnalysis.showBalance}
                        onChange={(e) => updateSettings('addressAnalysis.showBalance', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">显示交易记录</div>
                      <div className="text-xs text-gray-500">显示地址的历史交易</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.addressAnalysis.showTransactions}
                        onChange={(e) => updateSettings('addressAnalysis.showTransactions', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.addressAnalysis.showTransactions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        最大交易数量
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={settings.addressAnalysis.maxTransactions}
                        onChange={(e) => updateSettings('addressAnalysis.maxTransactions', parseInt(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">风险分析</div>
                      <div className="text-xs text-gray-500">分析地址的风险等级</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.addressAnalysis.riskAnalysis}
                        onChange={(e) => updateSettings('addressAnalysis.riskAnalysis', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">实时更新</div>
                      <div className="text-xs text-gray-500">实时监控地址变化</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.addressAnalysis.realTimeUpdates}
                        onChange={(e) => updateSettings('addressAnalysis.realTimeUpdates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* 数据仪表盘设置 */}
            <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">数据仪表盘</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">启用数据仪表盘</div>
                  <div className="text-xs text-gray-500">显示系统数据概览</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dashboard.enabled}
                    onChange={(e) => updateSettings('dashboard.enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.dashboard.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">显示NFT统计</div>
                      <div className="text-xs text-gray-500">在仪表盘显示NFT相关数据</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.dashboard.showNFTStats}
                        onChange={(e) => updateSettings('dashboard.showNFTStats', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">显示地址统计</div>
                      <div className="text-xs text-gray-500">在仪表盘显示地址分析数据</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.dashboard.showAddressStats}
                        onChange={(e) => updateSettings('dashboard.showAddressStats', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      刷新频率 ({settings.dashboard.refreshRate}秒)
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      step="30"
                      value={settings.dashboard.refreshRate}
                      onChange={(e) => updateSettings('dashboard.refreshRate', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>30秒</span>
                      <span>5分钟</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">紧凑视图</div>
                      <div className="text-xs text-gray-500">使用更紧凑的布局显示数据</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.dashboard.compactView}
                        onChange={(e) => updateSettings('dashboard.compactView', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
