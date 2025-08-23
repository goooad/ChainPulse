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

    // 尝试解析JSON响应
    let analysisResult
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        // 如果无法解析JSON，直接报错
        return res.status(500).json({
          success: false,
          error: 'Kimi API 返回内容格式不正确，无法解析为JSON'
        })
      }
    } catch (parseError: any) {
      return res.status(500).json({
        success: false,
        error: 'Kimi API 返回内容解析失败',
        details: parseError.message
      })
    }

    // 确保返回的数据结构与前端期望一致
    const responseData = {
      sentiment: analysisResult.sentiment || 'neutral',
      score: analysisResult.score || 0,
      confidence: analysisResult.confidence || 0.5,
      keywords: analysisResult.keywords || [],
      analysis: analysisResult.analysis || content
    };

    console.log('返回给前端的数据:', JSON.stringify(responseData, null, 2));

    res.json({
      success: true,
      ...responseData  // 直接展开数据，而不是嵌套在data字段中
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