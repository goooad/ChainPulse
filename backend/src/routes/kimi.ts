import express from 'express'
import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'

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
    
    // 配置代理（如果环境变量中有设置）
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    const fetchOptions: any = {
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
            content: '你是一个专业的NFT市场情绪分析师，擅长分析社交媒体数据并提供准确的情绪判断。请严格按照JSON格式返回分析结果，确保JSON格式正确，所有属性之间用逗号分隔。'
          },
          {
            role: 'user',
            content: `${prompt || texts || '请分析NFT市场情绪'}

请严格按照以下JSON格式返回分析结果，注意所有属性之间必须用逗号分隔：

{
  "sentiment": "positive/negative/neutral",
  "score": 0.0-1.0之间的数字,
  "confidence": 0.0-1.0之间的数字,
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "analysis": "详细的分析报告内容，包含完整的市场分析"
}

重要：请确保返回的是标准的JSON格式，所有属性之间用逗号分隔，字符串内容中的换行符用\\n表示。`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(30000)
    }

    // 如果有代理设置，使用代理
    if (proxyUrl) {
      console.log('使用代理:', proxyUrl)
      fetchOptions.agent = new HttpsProxyAgent(proxyUrl)
    }
    
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', fetchOptions)

    console.log('Kimi API响应状态:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Kimi API错误:', response.status, errorData)
      
      return res.status(response.status).json({
        success: false,
        error: `Kimi API返回状态码: ${response.status}`,
        details: errorData
      })
    }

    const apiResponseData = await response.json()
    console.log('Kimi API响应数据:', JSON.stringify(apiResponseData, null, 2))
    
    const content = apiResponseData.choices?.[0]?.message?.content

    if (!content) {
      return res.status(500).json({
        success: false,
        error: 'Kimi API 返回内容为空'
      })
    }

    console.log('Kimi API 返回的原始内容:', content)

    // 尝试解析JSON响应
    let analysisResult
    try {
      // 清理可能的markdown格式
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      console.log('清理后的内容:', cleanContent)
      
      analysisResult = JSON.parse(cleanContent)
      console.log('JSON解析成功:', analysisResult)
      
      // 清理analysis字段中的提示文本
      if (analysisResult.analysis && typeof analysisResult.analysis === 'string') {
        analysisResult.analysis = analysisResult.analysis
          .replace(/详细分析报告\s*-\s*请提供至少1000字的深度分析[^:]*:\s*/g, '')
          .trim();
      }
      
    } catch (parseError: any) {
      console.log('JSON解析失败，错误:', parseError.message)
      console.log('尝试解析的内容:', content)
      
      // 如果JSON解析失败，返回默认结果
      analysisResult = {
        sentiment: 'neutral',
        score: 0.5,
        confidence: 0.3,
        keywords: ['NFT', '分析'],
        analysis: '抱歉，分析结果格式解析失败。请重新尝试分析。'
      }
    }

    // 确保返回的数据结构与前端期望一致
    const responseData = {
      sentiment: analysisResult.sentiment || 'neutral',
      score: Number(analysisResult.score) || 0.5,
      confidence: Number(analysisResult.confidence) || 0.5,
      keywords: Array.isArray(analysisResult.keywords) ? analysisResult.keywords : ['NFT'],
      analysis: analysisResult.analysis || content || '分析完成'
    };

    console.log('返回给前端的数据:', JSON.stringify(responseData, null, 2));

    res.json({
      success: true,
      data: responseData  // 将数据嵌套在data字段中，与前端期望一致
    })

  } catch (error: any) {
    console.error('Kimi API 调用失败:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      error: 'Kimi情绪分析失败，请稍后重试'
    })
  }
})


export default router