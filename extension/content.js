// Web3Sentry 内容脚本 - 注入到所有网页中监控Web3活动

console.log('Web3Sentry内容脚本已加载')

// 注入监控脚本到页面
const script = document.createElement('script')
script.src = chrome.runtime.getURL('inject.js')
script.onload = function() {
  this.remove()
}
;(document.head || document.documentElement).appendChild(script)

// 监听来自注入脚本的消息
window.addEventListener('message', async (event) => {
  if (event.source !== window) return
  
  if (event.data.type === 'WEB3_SENTRY_TRANSACTION') {
    try {
      // 发送交易数据到后台脚本进行分析
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_TRANSACTION',
        data: event.data.payload
      })
      
      if (response.success) {
        const risk = response.data
        
        // 将风险分析结果发送回页面
        window.postMessage({
          type: 'WEB3_SENTRY_RISK_RESULT',
          payload: {
            transactionId: event.data.payload.id,
            risk: risk
          }
        }, '*')
        
        // 如果需要拦截交易
        if (shouldBlockTransaction(risk)) {
          showBlockDialog(risk, event.data.payload)
        }
      }
    } catch (error) {
      console.error('分析交易失败:', error)
    }
  }
})

// 判断是否应该拦截交易
async function shouldBlockTransaction(risk) {
  const response = await chrome.runtime.sendMessage({
    type: 'GET_SETTINGS'
  })
  
  if (!response.success) return false
  
  const settings = response.data
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

// 显示拦截对话框
function showBlockDialog(risk, transactionData) {
  // 创建模态对话框
  const dialog = document.createElement('div')
  dialog.id = 'web3-sentry-dialog'
  dialog.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      ">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="
            width: 40px;
            height: 40px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
          ">
            <span style="color: white; font-size: 20px;">⚠️</span>
          </div>
          <div>
            <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
              Web3Sentry 风险警报
            </h3>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
              检测到${risk.level}风险交易
            </p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 500;">
            风险原因:
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
            ${risk.reasons.map(reason => `<li>${reason}</li>`).join('')}
          </ul>
        </div>
        
        <div style="margin-bottom: 20px; padding: 12px; background: #f9fafb; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">交易详情:</div>
          <div style="font-size: 14px; color: #374151; font-family: monospace;">
            ${transactionData.to ? `发送到: ${transactionData.to.slice(0, 10)}...` : ''}
            ${transactionData.value ? `<br>金额: ${transactionData.value} ETH` : ''}
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="web3-sentry-block" style="
            padding: 8px 16px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">
            拦截交易
          </button>
          <button id="web3-sentry-allow" style="
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">
            允许继续
          </button>
        </div>
      </div>
    </div>
  `
  
  document.body.appendChild(dialog)
  
  // 绑定按钮事件
  document.getElementById('web3-sentry-block').onclick = () => {
    // 拦截交易
    window.postMessage({
      type: 'WEB3_SENTRY_BLOCK_TRANSACTION',
      payload: { transactionId: transactionData.id }
    }, '*')
    
    dialog.remove()
  }
  
  document.getElementById('web3-sentry-allow').onclick = () => {
    // 允许交易继续
    window.postMessage({
      type: 'WEB3_SENTRY_ALLOW_TRANSACTION',
      payload: { transactionId: transactionData.id }
    }, '*')
    
    dialog.remove()
  }
}

// 监听页面Web3活动
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // 检测MetaMask等钱包的DOM变化
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 检查是否为钱包相关元素
          if (node.querySelector && (
            node.querySelector('[data-testid*="metamask"]') ||
            node.querySelector('[class*="wallet"]') ||
            node.querySelector('[class*="connect"]')
          )) {
            console.log('检测到钱包活动')
          }
        }
      })
    }
  })
})

// 开始观察DOM变化
observer.observe(document.body, {
  childList: true,
  subtree: true
})