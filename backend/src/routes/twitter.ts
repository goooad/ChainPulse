import express from 'express'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'
import { generateMockTweets } from '../data/twitterMockData'
import { DataStorageUtils } from '../utils/dataStorage'

const router = express.Router()

// Twitter API 搜索推文 - 支持GET和POST方法
router.get('/search', async (req, res) => {
  try {
    const { q: query, count = 10, tweet_fields } = req.query
    const max_results = Math.max(10, Math.min(100, parseInt(count as string) || 10))
    const bearerToken = process.env.TWITTER_BEARER_TOKEN

    if (!bearerToken) {
      return res.status(503).json({
        success: false,
        error: 'Twitter Bearer Token 未配置，请联系管理员'
      })
    }

    const searchParams = new URLSearchParams({
      query: `${query} NFT -is:retweet lang:en`,
      max_results: max_results.toString(),
      'tweet.fields': (tweet_fields as string) || 'created_at,author_id,public_metrics,context_annotations',
      'expansions': 'author_id',
      'user.fields': 'username,name'
    })

    console.log('发送Twitter API请求:', `https://api.twitter.com/2/tweets/search/recent?${searchParams}`)

    // 配置代理（如果环境变量中有设置）
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    const fetchOptions: any = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': 'Web3Sentry/1.0'
      },
      signal: AbortSignal.timeout(30000) // 增加超时时间
    }

    // 如果有代理设置，使用代理
    if (proxyUrl) {
      console.log('使用代理:', proxyUrl)
      fetchOptions.agent = new HttpsProxyAgent(proxyUrl)
    }

    const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?${searchParams}`, fetchOptions)

    console.log('Twitter API响应状态:', response.status)
    const responseData: any = await response.json()
    console.log('Twitter API响应数据:', JSON.stringify(responseData, null, 2))

    // 检查Twitter API特定错误
    if (responseData.title === 'UsageCapExceeded') {
      console.log('Twitter API配额已用完:', responseData)
      return res.status(429).json({
        success: false,
        error: 'Twitter API月度配额已用完，请等待下个月重置或升级套餐',
        details: {
          message: responseData.detail,
          period: responseData.period,
          account_id: responseData.account_id
        }
      })
    }

    // 检查响应状态
    if (response.status !== 200) {
      console.log(`Twitter API返回非200状态码: ${response.status}`, responseData)
      
      // 先尝试读取对应NFT文件中的数据
      try {
        const cachedData = await DataStorageUtils.loadNFTDataFromFile(query as string)
        if (cachedData) {
          console.log('从NFT缓存文件读取数据:', query)
          return res.json({
            success: true,
            data: cachedData,
            isCachedData: true,
            message: '从缓存文件读取数据'
          })
        }
      } catch (cacheError: any) {
        console.log('读取NFT缓存文件失败:', cacheError.message)
      }
      
      // 如果缓存文件也不存在，返回固定mock数据
      console.log('返回固定mock数据')
      const mockData = generateMockTweets(query as string, max_results)
      return res.json({
        success: true,
        data: mockData,
        isMockData: true,
        message: '由于API限制且无缓存数据，返回模拟数据'
      })
    }

    // 检查是否有数据
    if (!responseData.data) {
      return res.json({
        success: true,
        data: {
          tweets: [],
          total: 0
        }
      })
    }

    // 创建用户信息映射
    const usersMap = new Map()
    if (responseData.includes?.users) {
      responseData.includes.users.forEach((user: any) => {
        usersMap.set(user.id, user)
      })
    }

    // 转换Twitter API响应格式
    const tweets = responseData.data.map((tweet: any) => {
      const user = usersMap.get(tweet.author_id)
      const username = user?.username || `user_${tweet.author_id.slice(-6)}`
      const name = user?.name || `User ${tweet.author_id.slice(-4)}`
      
      return {
        id: tweet.id,
        text: tweet.text,
        author_id: tweet.author_id,
        username: username,
        name: name,
        created_at: tweet.created_at,
        public_metrics: {
          retweet_count: tweet.public_metrics?.retweet_count || 0,
          like_count: tweet.public_metrics?.like_count || 0,
          reply_count: tweet.public_metrics?.reply_count || 0,
          quote_count: tweet.public_metrics?.quote_count || 0
        },
        url: `https://twitter.com/${username}/status/${tweet.id}`,
        engagement_score: (tweet.public_metrics?.like_count || 0) + 
                         (tweet.public_metrics?.retweet_count || 0) + 
                         (tweet.public_metrics?.reply_count || 0) + 
                         (tweet.public_metrics?.quote_count || 0)
      }
    })

    // 按互动数排序
    tweets.sort((a: any, b: any) => b.engagement_score - a.engagement_score)

    const responseDataToSend = {
      tweets,
      total: responseData.meta?.result_count || 0
    }

    // 保存 Twitter 数据到文件（按NFT关键词保存，覆盖旧文件）
    try {
      await DataStorageUtils.saveNFTDataToFile(responseDataToSend, query as string)
    } catch (saveError) {
      console.error('保存NFT数据文件失败，但不影响API响应:', saveError)
    }

    res.json({
      success: true,
      data: responseDataToSend
    })

  } catch (error: any) {
    console.error('Twitter API 调用失败:', error.message)
    console.error('错误详情:', error)
    
    const { q: query, count = 10 } = req.query
    
    // 先尝试读取对应NFT文件中的数据
    try {
      const cachedData = await DataStorageUtils.loadNFTDataFromFile(query as string)
      if (cachedData) {
        console.log('从NFT缓存文件读取数据:', query)
        return res.json({
          success: true,
          data: cachedData,
          isCachedData: true,
          message: '从缓存文件读取数据'
        })
      }
    } catch (cacheError: any) {
      console.log('读取NFT缓存文件失败:', cacheError.message)
    }
    
    // 如果缓存文件也不存在，返回固定mock数据
    console.log('返回固定mock数据')
    const mockData = generateMockTweets(query as string, parseInt(count as string) || 5)
    return res.json({
      success: true,
      data: mockData,
      isMockData: true,
      message: '由于网络错误且无缓存数据，返回模拟数据'
    })
  }
})

// Twitter API 搜索推文 - POST方法
router.post('/search', async (req, res) => {
  try {
    const { query, max_results = 100, tweet_fields } = req.body
    const validMaxResults = Math.max(10, Math.min(100, max_results))
    const bearerToken = process.env.TWITTER_API_KEY || process.env.TWITTER_BEARER_TOKEN

    console.log("Twitter API bearerToken: ",bearerToken)

    if (!bearerToken) {
      return res.status(503).json({
        success: false,
        error: 'Twitter Bearer Token 未配置，请联系管理员'
      })
    }

    const searchParams = new URLSearchParams({
      query: `${query} NFT -is:retweet lang:en`,
      max_results: max_results.toString(),
      'tweet.fields': tweet_fields || 'created_at,author_id,public_metrics,context_annotations',
      'expansions': 'author_id',
      'user.fields': 'username,name'
    })

    console.log('发送Twitter API请求:', `https://api.twitter.com/2/tweets/search/recent?${searchParams}`)

    // 配置代理（如果环境变量中有设置）
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    const fetchOptions: any = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': 'Web3Sentry/1.0'
      },
      signal: AbortSignal.timeout(30000) // 增加超时时间
    }

    // 如果有代理设置，使用代理
    if (proxyUrl) {
      console.log('使用代理:', proxyUrl)
      fetchOptions.agent = new HttpsProxyAgent(proxyUrl)
    }

    const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?${searchParams}`, fetchOptions)

    console.log('Twitter API响应状态:', response.status)
    const responseData: any = await response.json()
    //console.log('Twitter API响应数据:', JSON.stringify(responseData, null, 2))

    // // 检查Twitter API特定错误
    // if (responseData.title === 'UsageCapExceeded') {
    //   console.log('Twitter API配额已用完:', responseData)
    //   return res.status(429).json({
    //     success: false,
    //     error: 'Twitter API月度配额已用完，请等待下个月重置或升级套餐',
    //     details: {
    //       message: responseData.detail,
    //       period: responseData.period,
    //       account_id: responseData.account_id
    //     }
    //   })
    // }

    // 检查429错误（请求过于频繁）或其他非200状态码
    if (response.status !== 200) {
      console.log(`Twitter API返回非200状态码: ${response.status}`, responseData)
      
      // 先尝试读取对应NFT文件中的数据
      try {
        const cachedData = await DataStorageUtils.loadNFTDataFromFile(query)
        if (cachedData) {
          console.log('从NFT缓存文件读取数据:', query)
          return res.json({
            success: true,
            data: cachedData,
            isCachedData: true,
            message: '从缓存文件读取数据'
          })
        }
      } catch (cacheError: any) {
        console.log('读取NFT缓存文件失败:', cacheError.message)
      }
      
      // 如果缓存文件也不存在，返回固定mock数据
      console.log('返回固定mock数据')
      const mockData = generateMockTweets(query, max_results)
      return res.json({
        success: true,
        data: mockData,
        isMockData: true,
        message: '由于API限制且无缓存数据，返回模拟数据'
      })
    }

    // 检查是否有数据
    if (!responseData.data) {
      return res.json({
        success: true,
        data: {
          tweets: [],
          total: 0
        }
      })
    }

    // 创建用户信息映射
    const usersMap = new Map()
    if (responseData.includes?.users) {
      responseData.includes.users.forEach((user: any) => {
        usersMap.set(user.id, user)
      })
    }

    // 转换Twitter API响应格式
    const tweets = responseData.data.map((tweet: any) => {
      const user = usersMap.get(tweet.author_id)
      const username = user?.username || `user_${tweet.author_id.slice(-6)}`
      const name = user?.name || `User ${tweet.author_id.slice(-4)}`
      
      return {
        id: tweet.id,
        text: tweet.text,
        author_id: tweet.author_id,
        username: username,
        name: name,
        created_at: tweet.created_at,
        public_metrics: {
          retweet_count: tweet.public_metrics?.retweet_count || 0,
          like_count: tweet.public_metrics?.like_count || 0,
          reply_count: tweet.public_metrics?.reply_count || 0,
          quote_count: tweet.public_metrics?.quote_count || 0
        },
        url: `https://twitter.com/${username}/status/${tweet.id}`,
        engagement_score: (tweet.public_metrics?.like_count || 0) + 
                         (tweet.public_metrics?.retweet_count || 0) + 
                         (tweet.public_metrics?.reply_count || 0) + 
                         (tweet.public_metrics?.quote_count || 0)
      }
    })

    // 按互动数排序
    tweets.sort((a: any, b: any) => b.engagement_score - a.engagement_score)

    const responseDataToSend = {
      tweets,
      total: responseData.meta?.result_count || 0
    }

    // 保存 Twitter 数据到文件（按NFT关键词保存，覆盖旧文件）
    try {
      await DataStorageUtils.saveNFTDataToFile(responseDataToSend, query)
    } catch (saveError) {
      console.error('保存NFT数据文件失败，但不影响API响应:', saveError)
    }

    res.json({
      success: true,
      data: responseDataToSend
    })

  } catch (error: any) {
    console.error('Twitter API 调用失败:', error.message)
    console.error('错误详情:', error)
    
    const { query, max_results = 100 } = req.body
    
    // 先尝试读取对应NFT文件中的数据
    try {
      const cachedData = await DataStorageUtils.loadNFTDataFromFile(query)
      if (cachedData) {
        console.log('从NFT缓存文件读取数据:', query)
        return res.json({
          success: true,
          data: cachedData,
          isCachedData: true,
          message: '从缓存文件读取数据'
        })
      }
    } catch (cacheError: any) {
      console.log('读取NFT缓存文件失败:', cacheError.message)
    }
    
    // 如果缓存文件也不存在，返回固定mock数据
    console.log('返回固定mock数据')
    const mockData = generateMockTweets(query, max_results)
    return res.json({
      success: true,
      data: mockData,
      isMockData: true,
      message: '由于网络错误且无缓存数据，返回模拟数据'
    })
  }
})

export default router
