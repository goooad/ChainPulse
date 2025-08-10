import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

// Kimi API 情绪分析
router.post('/analyze', async (req, res) => {
  try {
    const { texts, task, prompt } = req.body
    const apiKey = process.env.MOONSHOT_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Kimi API Key 未配置'
      })
    }

    console.log('发送Kimi API请求...')
    
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的NFT市场情绪分析师，擅长分析社交媒体数据并提供准确的情绪判断。'
          },
          {
            role: 'user',
            content: prompt || texts || '请分析NFT市场情绪'
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(30000)
    })

    console.log('Kimi API响应状态:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Kimi API错误:', response.status, errorData)
      
      // 如果是500错误，返回模拟数据
      if (response.status === 500) {
        console.log('检测到500错误，返回模拟分析数据')
        const mockAnalysis = {
          sentiment: 'positive',
          score: 0.65,
          confidence: 0.75,
          keywords: ['NFT', '市场', '情绪', '分析'],
          analysis: '基于当前市场数据分析，该NFT项目呈现积极的市场情绪。社区活跃度较高，持有者信心较强。建议关注项目方的后续发展规划。'
        }
        
        return res.json({
          success: true,
          data: mockAnalysis,
          isMockData: true,
          message: '由于API限制(500)，返回模拟分析数据'
        })
      }
      
      return res.status(response.status).json({
        success: false,
        error: `Kimi API返回状态码: ${response.status}`,
        details: errorData
      })
    }

    const responseData = await response.json()
    console.log('Kimi API响应数据:', JSON.stringify(responseData, null, 2))
    
    const content = responseData.choices?.[0]?.message?.content

    if (!content) {
      return res.status(500).json({
        success: false,
        error: 'Kimi API 返回内容为空'
      })
    }

    // 尝试解析JSON响应
    let analysisResult
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        // 如果无法解析JSON，则进行简单的文本分析
        analysisResult = fallbackAnalysis(content)
      }
    } catch (parseError) {
      analysisResult = fallbackAnalysis(content)
    }

    res.json({
      success: true,
      data: {
        sentiment: analysisResult.sentiment || 'neutral',
        score: analysisResult.score || 0,
        confidence: analysisResult.confidence || 0.5,
        keywords: analysisResult.keywords || [],
        analysis: analysisResult.analysis || content
      }
    })

  } catch (error: any) {
    console.error('Kimi API 调用失败:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      error: 'Kimi情绪分析失败，请稍后重试'
    })
  }
})

// 简单的文本分析回退方案
function fallbackAnalysis(content: string) {
  const lowerContent = content.toLowerCase()
  
  const positiveWords = ['positive', '积极', '看好', '上涨', '牛市', 'bullish']
  const negativeWords = ['negative', '消极', '看空', '下跌', '熊市', 'bearish']
  
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
  let score = 0
  
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive'
    score = Math.min(0.8, 0.3 + positiveCount * 0.1)
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative'
    score = Math.max(-0.8, -0.3 - negativeCount * 0.1)
  }

  return {
    sentiment,
    score,
    confidence: 0.6,
    keywords: [],
    analysis: content
  }
}

export default router