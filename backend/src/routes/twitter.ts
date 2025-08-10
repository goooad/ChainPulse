import express from 'express'
import axios from 'axios'
import https from 'https'

const router = express.Router()

// Twitter API 搜索推文 - GET方法
router.get('/search', async (req, res) => {
  try {
    const { q: query, count = 100, tweet_fields } = req.query
    const max_results = parseInt(count as string) || 100
    const bearerToken = process.env.TWITTER_BEARER_TOKEN

    if (!bearerToken) {
      return res.status(500).json({
        success: false,
        error: 'Twitter Bearer Token 未配置'
      })
    }

    const searchParams = new URLSearchParams({
      query: `${query} NFT -is:retweet lang:en`,
      max_results: max_results.toString(),
      'tweet.fields': (tweet_fields as string) || 'created_at,author_id,public_metrics,context_annotations'
    })

    console.log('发送Twitter API请求:', `https://api.twitter.com/2/tweets/search/recent?${searchParams}`)

    const response = await axios.get(`https://api.twitter.com/2/tweets/search/recent?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': 'Web3Sentry/1.0'
      },
      timeout: 15000,
      validateStatus: function (status) {
        return status < 500; // 接受所有小于500的状态码
      },
      // 禁用代理以避免网络问题
      proxy: false,
      // 强制使用 HTTPS
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    })

    console.log('Twitter API响应状态:', response.status)
    console.log('Twitter API响应数据:', JSON.stringify(response.data, null, 2))

    // 检查响应状态
    if (response.status !== 200) {
      throw new Error(`Twitter API返回状态码: ${response.status}`)
    }

    // 转换Twitter API响应格式
    const tweets = response.data.data?.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author_id,
      created_at: tweet.created_at,
      metrics: {
        retweet_count: tweet.public_metrics?.retweet_count || 0,
        like_count: tweet.public_metrics?.like_count || 0,
        reply_count: tweet.public_metrics?.reply_count || 0,
      }
    })) || []

    res.json({
      success: true,
      data: {
        tweets,
        total: response.data.meta?.result_count || 0
      }
    })

  } catch (error: any) {
    console.error('Twitter API 调用失败:', error.response?.data || error.message)
    console.error('错误详情:', error.response?.status, error.response?.statusText)
    res.status(500).json({
      success: false,
      error: '获取Twitter数据失败，请检查网络连接或API配置',
      details: error.response?.data || error.message
    })
  }
})

export default router