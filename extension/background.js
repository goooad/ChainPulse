// Web3Sentry 浏览器扩展后台脚本

let isActive = true
let riskTransactions = []
let settings = {
  riskTolerance: 'MODERATE',
  autoBlock: true,
  requireConfirmation: true
}

// 监听扩展安装
chrome.runtime.onInstalled.addListener(() => {
  console.log('Web3Sentry扩展已安装')
  
  // 初始化设置
  chrome.storage.sync.set({
    isActive: true,
    settings: settings
  })
})

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'ANALYZE_TRANSACTION':
      analyzeTransaction(request.data)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true // 保持消息通道开放
    
    case 'GET_SETTINGS':
      chrome.storage.sync.get(['settings'], (result) => {
        sendResponse({ success: true, data: result.settings || settings })
      })
      return true
    
    case 'UPDATE_SETTINGS':
      chrome.storage.sync.set({ settings: request.data }, () => {
        settings = request.data
        sendResponse({ success: true })
      })
      return true
    
    case 'GET_STATUS':
      sendResponse({
        success: true,
        data: {
          isActive,
          blockedTransactions: riskTransactions.filter(tx => tx.blocked).length,
          totalAnalyzed: riskTransactions.length
        }
      })
      return true
  }
})

// 分析交易风险
async function analyzeTransaction(transactionData) {
  try {
    // 调用后端API分析交易
    const response = await fetch('http://localhost:3001/api/firewall/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      const risk = result.data
      
      // 记录风险交易
      riskTransactions.push({
        ...risk,
        blocked: shouldBlockTransaction(risk),
        timestamp: new Date()
      })
      
      // 如果是高风险交易，发送通知
      if (risk.level === 'HIGH' || risk.level === 'CRITICAL') {
        showRiskNotification(risk)
      }
      
      return risk
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('分析交易失败:', error)
    
    // 返回默认风险评估
    return {
      level: 'UNKNOWN',
      score: 0,
      reasons: ['无法连接到风险分析服务'],
      timestamp: new Date()
    }
  }
}

// 判断是否应该拦截交易
function shouldBlockTransaction(risk) {
  if (!settings.autoBlock) return false
  
  switch (settings.riskTolerance) {
    case 'CONSERVATIVE':
      return risk.level === 'MEDIUM' || risk.level === 'HIGH' || risk.level === 'CRITICAL'
    case 'MODERATE':
      return risk.level === 'HIGH' || risk.level === 'CRITICAL'
    case 'AGGRESSIVE':
      return risk.level === 'CRITICAL'
    default:
      return false
  }
}

// 显示风险通知
function showRiskNotification(risk) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Web3Sentry 风险警报',
    message: `检测到${risk.level}风险交易\n${risk.reasons.join(', ')}`
  })
}

// 监听网络请求
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // 检查是否为Web3相关请求
    if (isWeb3Request(details)) {
      console.log('检测到Web3请求:', details.url)
      
      // 这里可以进一步分析请求内容
      // 如果需要拦截，返回 {cancel: true}
    }
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
)

// 判断是否为Web3相关请求
function isWeb3Request(details) {
  const web3Patterns = [
    /ethereum/i,
    /web3/i,
    /metamask/i,
    /wallet/i,
    /rpc/i,
    /infura/i,
    /alchemy/i
  ]
  
  return web3Patterns.some(pattern => pattern.test(details.url))
}

// 定期清理旧的交易记录
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  riskTransactions = riskTransactions.filter(tx => 
    new Date(tx.timestamp).getTime() > oneHourAgo
  )
}, 10 * 60 * 1000) // 每10分钟清理一次