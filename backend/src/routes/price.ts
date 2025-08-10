import express from 'express'

const router = express.Router()

// 获取价格监控数据
router.get('/monitor', async (req, res) => {
  try {
    // 模拟价格数据
    const priceData = [
      {
        symbol: 'ETH',
        price: 2450.32,
        change24h: 5.67,
        volume: 15234567890,
        prediction: 'BULLISH',
        confidence: 0.78
      },
      {
        symbol: 'BTC',
        price: 43250.18,
        change24h: -2.34,
        volume: 28456789012,
        prediction: 'BEARISH',
        confidence: 0.65
      }
    ]
    
    res.json({
      success: true,
      data: priceData
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取价格数据失败'
    })
  }
})

// 获取价格历史
router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params
    const { timeRange = '24h' } = req.query
    
    // 模拟历史数据
    const history = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
      price: 2400 + Math.random() * 100,
      volume: 1000000 + Math.random() * 500000
    }))
    
    res.json({
      success: true,
      data: {
        symbol,
        timeRange,
        history
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取价格历史失败'
    })
  }
})

// 设置价格预警
router.post('/alert', async (req, res) => {
  try {
    const { symbol, targetPrice, type } = req.body
    
    if (!symbol || !targetPrice || !type) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      })
    }
    
    // 这里应该保存预警设置到数据库
    const alert = {
      id: Date.now().toString(),
      symbol,
      targetPrice,
      type, // 'above' | 'below'
      isActive: true,
      createdAt: new Date()
    }
    
    res.json({
      success: true,
      data: alert,
      message: '价格预警设置成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '设置价格预警失败'
    })
  }
})

export default router