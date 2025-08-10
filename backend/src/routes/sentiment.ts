import express from 'express'
import { SentimentService } from '../services/SentimentService'

const router = express.Router()
const sentimentService = new SentimentService()

// 获取NFT情绪分析
router.get('/nft', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query
    const signals = await sentimentService.getSentimentHistory(timeRange as string)
    
    res.json({
      success: true,
      data: signals
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取NFT情绪分析失败'
    })
  }
})

// 获取市场情绪概览
router.get('/overview', async (req, res) => {
  try {
    const overview = {
      overall: 'BULLISH',
      confidence: 0.75,
      trending: ['NFT', 'DeFi', 'GameFi'],
      lastUpdate: new Date()
    }
    
    res.json({
      success: true,
      data: overview
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取市场情绪概览失败'
    })
  }
})

// 手动触发情绪分析
router.post('/analyze', async (req, res) => {
  try {
    const signals = await sentimentService.analyzeNFTSentiment()
    
    res.json({
      success: true,
      data: signals,
      message: `分析完成，生成${signals.length}个情绪信号`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '情绪分析失败'
    })
  }
})

export default router