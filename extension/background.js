// Web3Sentry 浏览器扩展后台脚本

let isActive = true
let settings = {
  nftSentiment: true,
  addressAnalysis: true,
  notifications: true
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
    case 'ANALYZE_ADDRESS':
      analyzeAddress(request.data)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true // 保持消息通道开放
    
    case 'GET_SENTIMENT':
      getSentimentData(request.data)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
    
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
          features: {
            nftSentiment: settings.nftSentiment,
            addressAnalysis: settings.addressAnalysis
          }
        }
      })
      return true
  }
})

// 分析地址
async function analyzeAddress(addressData) {
  try {
    const response = await fetch('http://localhost:3001/api/address/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    })
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('分析地址失败:', error)
    throw error
  }
}

// 获取情绪数据
async function getSentimentData(query) {
  try {
    const response = await fetch('http://localhost:3001/api/sentiment/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    })
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('获取情绪数据失败:', error)
    throw error
  }
}

// 显示通知
function showNotification(title, message) {
  if (settings.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: title,
      message: message
    })
  }
}
