import express from 'express'
import { FirewallService } from '../services/FirewallService'

const router = express.Router()
const firewallService = new FirewallService()

// 获取风险交易历史
router.get('/risks', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    // 这里应该从数据库获取风险交易历史
    const risks: any[] = [] // 模拟数据
    
    res.json({
      success: true,
      data: risks,
      total: risks.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取风险交易失败'
    })
  }
})

// 分析特定交易
router.post('/analyze', async (req, res) => {
  try {
    const { transactionHash } = req.body
    
    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        error: '缺少交易哈希'
      })
    }

    // 这里应该调用FirewallService分析交易
    const risk = {
      transactionHash,
      level: 'LOW',
      score: 10,
      reasons: ['交易正常'],
      timestamp: new Date()
    }

    res.json({
      success: true,
      data: risk
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '分析交易失败'
    })
  }
})

// 获取防火墙状态
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      isActive: true,
      blockedTransactions: 0,
      analyzedTransactions: 0,
      lastUpdate: new Date()
    }
  })
})

export default router