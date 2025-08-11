import axios from 'axios';
import { TwitterSearchParams, TwitterSearchResponse, KimiAnalysisParams, KimiAnalysisResponse } from '../types/api';
import { MockApiService, useMockData } from '../mocks/api';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// 添加请求拦截器用于调试
api.interceptors.request.use(
  (config) => {
    console.log('发送API请求:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 配置状态服务
export class ConfigService {
  static async getStatus(): Promise<{
    twitter: { configured: boolean; enabled: boolean };
    kimi: { configured: boolean; enabled: boolean };
  }> {
    try {
      console.log('正在调用配置状态API...');
      console.log('API baseURL:', api.defaults.baseURL);
      
      const response = await api.get('/config/status');
      console.log('配置状态API响应:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        console.log('返回配置数据:', response.data.data);
        return response.data.data;
      } else {
        console.error('配置状态API响应格式错误:', response.data);
        // 如果API响应格式不对，但有数据，尝试直接返回
        if (response.data && response.data.twitter && response.data.kimi) {
          return response.data;
        }
        throw new Error('配置状态API响应格式错误');
      }
    } catch (error: any) {
      console.error('获取配置状态失败:', error);
      console.error('错误详情:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // 如果是网络错误，不要返回默认状态，而是抛出错误
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        throw error;
      }
      
      // 只有在真正的API错误时才返回默认状态
      return {
        twitter: { configured: false, enabled: false },
        kimi: { configured: false, enabled: false }
      };
    }
  }
  
  // 保持向后兼容
  static async getConfigStatus(): Promise<{
    twitter: { configured: boolean; enabled: boolean };
    kimi: { configured: boolean; enabled: boolean };
  }> {
    return this.getStatus();
  }
}

// Twitter API 服务
export class TwitterService {

  static async searchTweets(params: TwitterSearchParams): Promise<TwitterSearchResponse> {
    try {
      const response = await api.post('/twitter/search', {
        query: params.query,
        max_results: params.max_results || 100,
        tweet_fields: params.tweet_fields || 'created_at,author_id,public_metrics,context_annotations'
      });

      // 检查响应是否成功
      if (!response.data.success) {
        throw new Error(response.data.error || '获取Twitter数据失败');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Twitter API 调用失败:', error);
      
      // 处理特定的错误类型
      if (error.response?.status === 429) {
        throw new Error('Twitter API配额已用完，请稍后重试或联系管理员');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('获取Twitter数据失败，请检查网络连接或API配置');
      }
    }
  }


  static async getTweetsByHashtag(hashtag: string, maxResults: number = 100): Promise<TwitterSearchResponse> {
    return this.searchTweets({
      query: `#${hashtag} NFT -is:retweet lang:en`,
      max_results: maxResults,
      tweet_fields: 'created_at,author_id,public_metrics,context_annotations'
    });
  }

  static async getTweetsByKeyword(keyword: string, maxResults: number = 100): Promise<TwitterSearchResponse> {
    return this.searchTweets({
      query: `${keyword} NFT -is:retweet lang:en`,
      max_results: maxResults,
      tweet_fields: 'created_at,author_id,public_metrics,context_annotations'
    });
  }
}

// Kimi API 服务
export class KimiService {
  static async analyzeSentiment(params: KimiAnalysisParams): Promise<KimiAnalysisResponse> {
    try {
      const response = await api.post('/kimi/analyze', {
        texts: params.texts,
        task: params.task,
        prompt: params.prompt
      });

      console.log('Kimi API响应:', response.data);

      // 检查响应是否成功
      if (!response.data.success) {
        throw new Error(response.data.error || 'Kimi情绪分析失败');
      }

      // 返回分析结果，现在数据直接在response.data中，不再嵌套在data字段中
      return {
        sentiment: response.data.sentiment,
        score: response.data.score,
        confidence: response.data.confidence,
        keywords: response.data.keywords,
        analysis: response.data.analysis
      };
    } catch (error) {
      console.error('Kimi API 调用失败:', error);
      throw new Error('Kimi情绪分析失败，请稍后重试');
    }
  }



  static async analyzeNFTSentiment(tweets: string[], collection: string): Promise<KimiAnalysisResponse> {
    const prompt = `请分析以下关于NFT项目"${collection}"的推文内容，进行情绪分析：

任务要求：
1. 分析整体情绪倾向（positive/negative/neutral）
2. 给出情绪得分（-1到1之间，-1最负面，1最正面，0中性）
3. 计算分析置信度（0到1之间）
4. 提取关键词（5-10个最重要的词汇）
5. 提供详细的分析说明（200字左右）

分析维度：
- 价格趋势讨论
- 项目发展前景
- 社区活跃度
- 技术创新
- 市场表现
- 风险因素

请严格按照以下JSON格式返回结果：
{
  "sentiment": "positive/negative/neutral",
  "score": 数值,
  "confidence": 数值,
  "keywords": ["关键词1", "关键词2", ...],
  "analysis": "详细分析说明"
}

推文内容：
${tweets.join('\n---\n')}`;

    return this.analyzeSentiment({
      texts: tweets,
      task: 'nft_sentiment_analysis',
      prompt
    });
  }
}

// NFT情绪分析综合服务
export class NFTSentimentService {
  static async analyzeSentiment(query: string): Promise<{
    twitterData: TwitterSearchResponse;
    sentimentAnalysis: KimiAnalysisResponse;
  }> {
    try {
      // 调试信息
      console.log('NFT情绪分析服务启动:', {
        query,
        useMockData,
        hasTwitterToken: !!import.meta.env.VITE_TWITTER_BEARER_TOKEN,
        hasKimiKey: !!import.meta.env.VITE_KIMI_API_KEY,
        useRealApi: import.meta.env.VITE_USE_REAL_API,
        twitterToken: import.meta.env.VITE_TWITTER_BEARER_TOKEN ? '已设置' : '未设置',
        kimiKey: import.meta.env.VITE_KIMI_API_KEY ? '已设置' : '未设置'
      });

      // 开发环境使用模拟数据
      if (useMockData) {
        console.log('使用模拟数据进行NFT情绪分析');
        const twitterData = await MockApiService.mockTwitterSearch(query);
        const tweetTexts = twitterData.tweets.map(tweet => tweet.text);
        const sentimentAnalysis = await MockApiService.mockKimiAnalysis(tweetTexts, query);
        
        return {
          twitterData,
          sentimentAnalysis
        };
      }

      // 使用真实API
      try {
        // 1. 获取Twitter数据
        const twitterData = await TwitterService.getTweetsByKeyword(query);
        
        if (!twitterData.tweets || twitterData.tweets.length === 0) {
          throw new Error('未找到相关推文数据，请尝试其他关键词');
        }

        // 2. 提取推文文本
        const tweetTexts = twitterData.tweets.map(tweet => tweet.text);

        // 3. 调用Kimi进行情绪分析
        const sentimentAnalysis = await KimiService.analyzeNFTSentiment(tweetTexts, query);

        return {
          twitterData,
          sentimentAnalysis
        };
      } catch (twitterError: any) {
        // 如果Twitter API失败，提供更详细的错误信息
        if (twitterError.message.includes('配额已用完')) {
          throw new Error('Twitter API配额已用完，请稍后重试或联系管理员升级API计划');
        } else {
          throw twitterError;
        }
      }
    } catch (error) {
      console.error('NFT情绪分析失败:', error);
      throw error;
    }
  }

  static async getHistoricalSentiment(_query: string, _days: number = 7): Promise<any[]> {
    // 这里可以实现历史情绪数据的获取
    // 暂时返回空数组，后续可以扩展
    return [];
  }
}

// 价格监控服务
export class PriceService {
  static async getPriceData(): Promise<any> {
    try {
      const response = await api.get('/price/monitor');
      if (!response.data.success) {
        throw new Error(response.data.error || '获取价格数据失败');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('获取价格数据失败:', error);
      throw new Error('获取价格数据失败，请稍后重试');
    }
  }

  static async getPriceHistory(symbol: string, timeRange: string = '24h'): Promise<any> {
    try {
      const response = await api.get(`/price/history/${symbol}`, {
        params: { timeRange }
      });
      if (!response.data.success) {
        throw new Error(response.data.error || '获取价格历史失败');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('获取价格历史失败:', error);
      throw new Error('获取价格历史失败，请稍后重试');
    }
  }

  static async addPriceAlert(alert: { symbol: string; targetPrice: number; type: string }): Promise<any> {
    try {
      const response = await api.post('/price/alert', alert);
      if (!response.data.success) {
        throw new Error(response.data.error || '设置价格预警失败');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('设置价格预警失败:', error);
      throw new Error('设置价格预警失败，请稍后重试');
    }
  }
}

// 错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      const message = error.response.data?.message || '服务器错误';
      throw new Error(`API错误 (${error.response.status}): ${message}`);
    } else if (error.request) {
      // 请求发送但没有收到响应
      throw new Error('网络连接失败，请检查网络设置');
    } else {
      // 其他错误
      throw new Error('请求配置错误');
    }
  }
);

export default api;