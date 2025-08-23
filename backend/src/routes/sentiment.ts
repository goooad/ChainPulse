import express from 'express'
import { SentimentService } from '../services/SentimentService'
import fetch from 'node-fetch'

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

// 获取情绪历史数据
router.get('/history', async (req, res) => {
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
      error: '获取情绪历史数据失败'
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

// 分析推文情感
router.post('/tweets', async (req, res) => {
  try {
    const { tweets, query } = req.body
    
    if (!tweets || !Array.isArray(tweets) || tweets.length === 0) {
      return res.status(400).json({
        success: false,
        error: '缺少推文数据'
      })
    }

    console.log(`🤖 [Kimi] 开始分析 ${tweets.length} 条推文的情感`)

    // 调用 Kimi API 分析推文
    const analysis = await analyzeTwitterSentimentWithKimi(tweets, query)
    
    res.json({
      success: true,
      data: analysis
    })

  } catch (error) {
    console.error('❌ [Kimi] 推文情感分析失败:', error)
    res.status(500).json({
      success: false,
      error: '推文情感分析失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 调用 Kimi API 分析推文情感
async function analyzeTwitterSentimentWithKimi(tweets: any[], query: string) {
  const kimiApiKey = process.env.KIMI_API_KEY
  
  if (!kimiApiKey) {
    throw new Error('Kimi API Key 未配置')
  }

  // 准备发送给 Kimi 的推文数据
  const tweetData = tweets.map(tweet => ({
    id: tweet.id,
    text: tweet.text,
    author: tweet.username || tweet.name || 'Unknown',
    created_at: tweet.created_at,
    metrics: {
      likes: tweet.public_metrics?.like_count || 0,
      retweets: tweet.public_metrics?.retweet_count || 0,
      replies: tweet.public_metrics?.reply_count || 0,
      quotes: tweet.public_metrics?.quote_count || 0
    },
    engagement_score: tweet.engagement_score || 0,
    url: tweet.url
  }))

  const prompt = `请分析以下关于"${query}"的Twitter推文数据，并提供详细的情感分析报告：

推文数据：
${JSON.stringify(tweetData, null, 2)}

请从以下几个维度进行分析：

1. **整体情感倾向**：
   - 正面情感比例
   - 负面情感比例  
   - 中性情感比例
   - 整体市场情绪（看涨/看跌/中性）

2. **热度分析**：
   - 最受关注的推文（基于点赞、转发、回复数）
   - 讨论热点话题
   - 影响力用户观点

3. **市场信号**：
   - 价格相关讨论
   - 技术分析观点
   - 基本面消息
   - 风险提示

4. **用户行为**：
   - 散户vs机构观点
   - FOMO情绪指标
   - 恐慌情绪指标

5. **投资建议**：
   - 基于情感分析的市场预测
   - 风险评估
   - 操作建议

请以JSON格式返回分析结果，包含以上所有维度的详细数据。`

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${kimiApiKey}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`Kimi API 请求失败: ${response.status}`)
    }

    const data = await response.json()
    const analysisText = data.choices[0]?.message?.content

    if (!analysisText) {
      throw new Error('Kimi API 返回空结果')
    }

    // 尝试解析 JSON 响应
    let analysisResult
    try {
      // 提取 JSON 部分（如果被包装在其他文本中）
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        // 如果没有找到 JSON，创建一个基本的分析结果
        analysisResult = {
          overall_sentiment: '中性',
          sentiment_distribution: {
            positive: 40,
            negative: 30,
            neutral: 30
          },
          market_signal: '观望',
          summary: analysisText,
          analyzed_tweets: tweets.length,
          timestamp: new Date().toISOString()
        }
      }
    } catch (parseError) {
      // JSON 解析失败，返回文本分析
      analysisResult = {
        overall_sentiment: '中性',
        sentiment_distribution: {
          positive: 40,
          negative: 30,
          neutral: 30
        },
        market_signal: '观望',
        summary: analysisText,
        analyzed_tweets: tweets.length,
        timestamp: new Date().toISOString()
      }
    }

    return analysisResult

  } catch (error) {
    console.error('❌ [Kimi] API 调用失败:', error)
    throw error
  }
}

export default router
