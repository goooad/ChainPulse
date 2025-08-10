// Web3Sentry 弹窗脚本

document.addEventListener('DOMContentLoaded', async () => {
  // 初始化弹窗
  await initializePopup()
  
  // 绑定事件监听器
  bindEventListeners()
  
  // 定期更新状态
  setInterval(updateStatus, 5000)
})

async function initializePopup() {
  try {
    // 获取扩展状态
    const response = await chrome.runtime.sendMessage({
      type: 'GET_STATUS'
    })
    
    if (response.success) {
      updateUI(response.data)
    }
  } catch (error) {
    console.error('初始化弹窗失败:', error)
  }
}

function bindEventListeners() {
  // 防护开关
  const protectionToggle = document.getElementById('protection-toggle')
  protectionToggle.addEventListener('change', async (e) => {
    const isActive = e.target.checked
    
    try {
      await chrome.storage.sync.set({ isActive })
      
      // 更新状态指示器
      const indicator = document.querySelector('.status-indicator')
      if (isActive) {
        indicator.classList.remove('inactive')
      } else {
        indicator.classList.add('inactive')
      }
      
      console.log('防护状态已更新:', isActive)
    } catch (error) {
      console.error('更新防护状态失败:', error)
    }
  })
  
  // 打开控制面板
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'http://localhost:5173'
    })
  })
  
  // 设置按钮
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'http://localhost:5173/settings'
    })
  })
}

async function updateStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_STATUS'
    })
    
    if (response.success) {
      updateUI(response.data)
    }
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

function updateUI(status) {
  // 更新统计数据
  document.getElementById('blocked-count').textContent = status.blockedTransactions || 0
  document.getElementById('analyzed-count').textContent = status.totalAnalyzed || 0
  
  // 更新风险等级
  const riskLevel = calculateRiskLevel(status)
  document.getElementById('risk-level').textContent = riskLevel
  
  // 更新防护状态
  const protectionToggle = document.getElementById('protection-toggle')
  protectionToggle.checked = status.isActive
  
  const indicator = document.querySelector('.status-indicator')
  if (status.isActive) {
    indicator.classList.remove('inactive')
  } else {
    indicator.classList.add('inactive')
  }
}

function calculateRiskLevel(status) {
  const blockedRatio = status.totalAnalyzed > 0 ? 
    status.blockedTransactions / status.totalAnalyzed : 0
  
  if (blockedRatio > 0.3) return '高风险'
  if (blockedRatio > 0.1) return '中等风险'
  return '安全'
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_POPUP') {
    updateUI(request.data)
  }
})

// 添加最近活动
function addActivity(type, message) {
  const activityList = document.getElementById('activity-list')
  
  const activityItem = document.createElement('div')
  activityItem.className = `activity-item risk-${type}`
  
  const icon = type === 'high' ? '🚨' : type === 'medium' ? '⚠️' : '✅'
  
  activityItem.innerHTML = `
    <div>${icon} ${message}</div>
    <div class="activity-time">刚刚</div>
  `
  
  // 插入到列表顶部
  activityList.insertBefore(activityItem, activityList.firstChild)
  
  // 限制显示的活动数量
  const items = activityList.children
  if (items.length > 5) {
    activityList.removeChild(items[items.length - 1])
  }
}

// 模拟添加一些活动（实际应该从background script接收）
setTimeout(() => {
  addActivity('low', '交易安全检查通过')
}, 2000)

setTimeout(() => {
  addActivity('medium', '检测到可疑合约调用')
}, 5000)