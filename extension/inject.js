// Web3Sentry 注入脚本 - 监控页面中的Web3活动

console.log('Web3Sentry注入脚本已加载')

// 保存原始的Web3方法
const originalMethods = {}

// 监控的交易ID
let transactionCounter = 0
const pendingTransactions = new Map()

// 拦截window.ethereum对象
if (typeof window.ethereum !== 'undefined') {
  console.log('检测到Web3钱包')
  
  // 拦截request方法
  if (window.ethereum.request) {
    originalMethods.request = window.ethereum.request.bind(window.ethereum)
    
    window.ethereum.request = async function(args) {
      console.log('拦截到Web3请求:', args)
      
      // 检查是否为交易相关请求
      if (isTransactionMethod(args.method)) {
        const transactionId = `tx_${++transactionCounter}_${Date.now()}`
        
        // 发送交易数据进行风险分析
        window.postMessage({
          type: 'WEB3_SENTRY_TRANSACTION',
          payload: {
            id: transactionId,
            method: args.method,
            params: args.params,
            timestamp: new Date().toISOString()
          }
        }, '*')
        
        // 等待风险分析结果
        const shouldProceed = await waitForRiskAnalysis(transactionId)
        
        if (!shouldProceed) {
          throw new Error('交易被Web3Sentry拦截')
        }
      }
      
      // 调用原始方法
      return originalMethods.request(args)
    }
  }
  
  // 拦截sendAsync方法（旧版本钱包）
  if (window.ethereum.sendAsync) {
    originalMethods.sendAsync = window.ethereum.sendAsync.bind(window.ethereum)
    
    window.ethereum.sendAsync = function(payload, callback) {
      console.log('拦截到sendAsync请求:', payload)
      
      if (isTransactionMethod(payload.method)) {
        const transactionId = `tx_${++transactionCounter}_${Date.now()}`
        
        window.postMessage({
          type: 'WEB3_SENTRY_TRANSACTION',
          payload: {
            id: transactionId,
            method: payload.method,
            params: payload.params,
            timestamp: new Date().toISOString()
          }
        }, '*')
        
        // 对于sendAsync，我们需要修改回调
        const originalCallback = callback
        callback = function(error, result) {
          if (error && error.message && error.message.includes('Web3Sentry')) {
            // 交易被拦截
            console.log('交易被Web3Sentry拦截')
          }
          originalCallback(error, result)
        }
      }
      
      return originalMethods.sendAsync(payload, callback)
    }
  }
}

// 监控Web3.js
if (typeof window.Web3 !== 'undefined') {
  console.log('检测到Web3.js')
  // 这里可以添加Web3.js的监控逻辑
}

// 监控ethers.js
if (typeof window.ethers !== 'undefined') {
  console.log('检测到ethers.js')
  // 这里可以添加ethers.js的监控逻辑
}

// 判断是否为交易相关方法
function isTransactionMethod(method) {
  const transactionMethods = [
    'eth_sendTransaction',
    'eth_signTransaction',
    'eth_sign',
    'personal_sign',
    'eth_signTypedData',
    'eth_signTypedData_v1',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
    'wallet_addEthereumChain',
    'wallet_switchEthereumChain'
  ]
  
  return transactionMethods.includes(method)
}

// 等待风险分析结果
function waitForRiskAnalysis(transactionId, timeout = 10000) {
  return new Promise((resolve) => {
    let resolved = false
    
    // 设置超时
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        console.log('风险分析超时，允许交易继续')
        resolve(true)
      }
    }, timeout)
    
    // 监听风险分析结果
    const messageHandler = (event) => {
      if (event.source !== window) return
      
      if (event.data.type === 'WEB3_SENTRY_RISK_RESULT' && 
          event.data.payload.transactionId === transactionId) {
        
        if (!resolved) {
          resolved = true
          clearTimeout(timeoutId)
          window.removeEventListener('message', messageHandler)
          
          const risk = event.data.payload.risk
          console.log('收到风险分析结果:', risk)
          
          // 根据风险等级决定是否继续
          resolve(risk.level !== 'CRITICAL')
        }
      }
      
      // 监听用户的拦截/允许决定
      if (event.data.type === 'WEB3_SENTRY_BLOCK_TRANSACTION' &&
          event.data.payload.transactionId === transactionId) {
        
        if (!resolved) {
          resolved = true
          clearTimeout(timeoutId)
          window.removeEventListener('message', messageHandler)
          resolve(false)
        }
      }
      
      if (event.data.type === 'WEB3_SENTRY_ALLOW_TRANSACTION' &&
          event.data.payload.transactionId === transactionId) {
        
        if (!resolved) {
          resolved = true
          clearTimeout(timeoutId)
          window.removeEventListener('message', messageHandler)
          resolve(true)
        }
      }
    }
    
    window.addEventListener('message', messageHandler)
  })
}

// 监控页面中的Web3相关活动
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 检查新添加的元素是否包含Web3相关内容
          if (node.textContent && (
            node.textContent.includes('Connect Wallet') ||
            node.textContent.includes('MetaMask') ||
            node.textContent.includes('WalletConnect') ||
            node.textContent.includes('Sign Transaction')
          )) {
            console.log('检测到Web3界面元素:', node.textContent.slice(0, 100))
          }
        }
      })
    }
  })
})

// 开始观察DOM变化
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
} else {
  // 如果body还没加载，等待DOM加载完成
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

// 监控网络请求（通过拦截fetch和XMLHttpRequest）
const originalFetch = window.fetch
window.fetch = function(...args) {
  const url = args[0]
  
  // 检查是否为Web3相关请求
  if (typeof url === 'string' && isWeb3Url(url)) {
    console.log('检测到Web3网络请求:', url)
  }
  
  return originalFetch.apply(this, args)
}

const originalXHROpen = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  if (isWeb3Url(url)) {
    console.log('检测到Web3 XHR请求:', url)
  }
  
  return originalXHROpen.call(this, method, url, ...args)
}

// 判断是否为Web3相关URL
function isWeb3Url(url) {
  const web3Patterns = [
    /infura\.io/i,
    /alchemy\.com/i,
    /quicknode\.com/i,
    /moralis\.io/i,
    /ethereum/i,
    /web3/i,
    /rpc/i,
    /jsonrpc/i
  ]
  
  return web3Patterns.some(pattern => pattern.test(url))
}

console.log('Web3Sentry监控已激活')