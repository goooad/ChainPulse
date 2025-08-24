import axios from 'axios'
import cron from 'node-cron'
import { SentimentSignal, SentimentType } from '../types'

export class SentimentService {
  private isMonitoring = false
  private moonshotApiKey: string
  private twitterApiKey: string

  constructor() {
    this.moonshotApiKey = process.env.MOONSHOT_API_KEY || ''
    this.twitterApiKey = process.env.TWITTER_API_KEY || ''
  }

  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    console.log('📊 情绪分析监控已启动')

    // 每5分钟分析一次NFT情绪
    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.analyzeNFTSentiment()
      } catch (error) {
        console.error('NFT情绪分析失败:', error)
      }
    })

    // 每小时分析一次整体市场情绪
    cron.schedule('0 * * * *', async () => {
      try {
        await this.analyzeMarketSentiment()
      } catch (error) {
        console.error('市场情绪分析失败:', error)
      }
    })
  }

  async analyzeNFTSentiment(): Promise<SentimentSignal[]> {
    const signals: SentimentSignal[] = []

    try {
      // 1. 获取Twitter上的NFT相关推文
      const tweets = await this.getTwitterData('NFT OR "non-fungible token" OR OpenSea OR "digital art"')
      
      // 2. 获取Discord上的NFT讨论
      const discordData = await this.getDiscordData()
      
      // 3. 获取Farcaster上的相关内容
      const farcasterData = await this.getFarcasterData()

      // 4. 合并所有数据源
      const allData = [...tweets, ...discordData, ...farcasterData]

      // 5. 使用Moonshot进行情绪分析
      for (const data of allData) {
        const sentiment = await this.analyzeSentimentWithMoonshot(data)
        if (sentiment) {
          signals.push(sentiment)
        }
      }

      console.log(`📊 分析了 ${allData.length} 条数据，生成 ${signals.length} 个情绪信号`)
      
      // 6. 保存到数据库或缓存
      await this.saveSentimentSignals(signals)

    } catch (error) {
      console.error('NFT情绪分析失败:', error)
    }

    return signals
  }

  async analyzeMarketSentiment(): Promise<SentimentSignal[]> {
    const signals: SentimentSignal[] = []

    try {
      // 分析整体加密货币市场情绪
      const marketData = await this.getMarketData()
      
      for (const data of marketData) {
        const sentiment = await this.analyzeSentimentWithMoonshot(data)
        if (sentiment) {
          signals.push(sentiment)
        }
      }

      await this.saveSentimentSignals(signals)

    } catch (error) {
      console.error('市场情绪分析失败:', error)
    }

    return signals
  }

  private async getTwitterData(query: string): Promise<any[]> {
    try {
      if (!this.twitterApiKey) {
        console.warn('Twitter API密钥未配置')
        return []
      }

      const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
        headers: {
          'Authorization': `Bearer ${this.twitterApiKey}`
        },
        params: {
          query: query,
          max_results: 100,
          'tweet.fields': 'created_at,author_id,public_metrics,context_annotations',
          'user.fields': 'verified,public_metrics'
        }
      })

      return response.data.data || []
    } catch (error) {
      console.error('获取Twitter数据失败:', error)
      return []
    }
  }

  private async getDiscordData(): Promise<any[]> {
    // Discord数据获取比较复杂，需要通过Bot或者爬虫
    // 这里返回模拟数据
    return [
      {
        content: "New NFT collection looks promising! Great art and strong community.",
        timestamp: new Date(),
        source: 'discord',
        channel: 'nft-general'
      },
      {
        content: "Market is looking bearish, might be a good time to buy the dip",
        timestamp: new Date(),
        source: 'discord',
        channel: 'trading'
      }
    ]
  }

  private async getFarcasterData(): Promise<any[]> {
    try {
      // Farcaster API调用
      const response = await axios.get('https://api.farcaster.xyz/v2/casts', {
        params: {
          limit: 10,
          cursor: ''
        }
      })

      return response.data.result?.casts || []
    } catch (error) {
      console.error('获取Farcaster数据失败:', error)
      return []
    }
  }

  private async getMarketData(): Promise<any[]> {
    try {
      // 获取加密货币新闻和市场数据
      const newsResponse = await axios.get('https://api.coingecko.com/api/v3/news')
      return newsResponse.data || []
    } catch (error) {
      console.error('获取市场数据失败:', error)
      return []
    }
  }

  private async analyzeSentimentWithMoonshot(data: any): Promise<SentimentSignal | null> {
    try {
      if (!this.moonshotApiKey) {
        console.warn('Moonshot API密钥未配置')
        return null
      }

      const prompt = `
请分析以下内容的情绪倾向，并返回JSON格式的结果：

内容: "${data.content || data.text || data.title}"
来源: ${data.source || 'unknown'}
时间: ${data.timestamp || data.created_at || new Date()}

请分析并返回以下格式的JSON：
{
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "confidence": 0.0-1.0,
  "reasoning": "分析原因",
  "keywords": ["关键词1", "关键词2"],
  "impact": "HIGH" | "MEDIUM" | "LOW"
}

分析要求：
1. BULLISH表示看涨/积极情绪
2. BEARISH表示看跌/消极情绪  
3. NEUTRAL表示中性情绪
4. confidence表示置信度(0-1)
5. reasoning解释分析原因
6. keywords提取关键词
7. impact评估影响程度
`

      const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
        model: 'moonshot-v1-8k',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.moonshotApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = JSON.parse(response.data.choices[0].message.content)
      
      const signal: SentimentSignal = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        symbol: 'NFT', // 默认符号
        sentiment: result.sentiment as SentimentType,
        score: result.confidence * 100, // 转换为分数
        confidence: result.confidence,
        reasoning: result.reasoning,
        sources: [data.source || 'unknown'],
        timestamp: new Date(),
        metadata: {
          keywords: result.keywords || [],
          impact: result.impact || 'MEDIUM',
          rawData: data
        }
      }

      return signal
    } catch (error) {
      console.error('Claude情绪分析失败:', error)
      return null
    }
  }

  private async saveSentimentSignals(signals: SentimentSignal[]) {
    // 这里应该保存到数据库
    // 暂时只打印日志
    console.log(`💾 保存了 ${signals.length} 个情绪信号`)
    
    // 发送到WebSocket客户端
    for (const signal of signals) {
      if (signal.confidence > 0.7) { // 只发送高置信度的信号
        console.log(`📡 发送高置信度情绪信号: ${signal.sentiment} (${signal.confidence})`)
        // wsService.broadcast('sentiment-signal', signal)
      }
    }
  }

  async getSentimentHistory(timeRange: string = '24h'): Promise<SentimentSignal[]> {
    // 从数据库获取历史情绪数据
    // 这里返回模拟数据
    return [
      {
        id: '1',
        symbol: 'NFT',
        sentiment: 'BULLISH',
        score: 85,
        confidence: 0.85,
        reasoning: 'NFT市场出现积极信号，多个蓝筹项目价格上涨',
        sources: ['twitter'],
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
        metadata: {
          keywords: ['NFT', 'bullish', 'moon'],
          impact: 'HIGH'
        }
      },
      {
        id: '2',
        symbol: 'NFT',
        sentiment: 'BEARISH',
        score: 72,
        confidence: 0.72,
        reasoning: '市场担忧情绪上升，交易量下降',
        sources: ['discord'],
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1小时前
        metadata: {
          keywords: ['bear', 'dump', 'sell'],
          impact: 'MEDIUM'
        }
      }
    ]
  }

  stopMonitoring() {
    this.isMonitoring = false
    console.log('📊 情绪分析监控已停止')
  }
}