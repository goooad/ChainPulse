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
  static async getConfigStatus(): Promise<{
    twitter: { configured: boolean; enabled: boolean };
    kimi: { configured: boolean; enabled: boolean };
  }> {
    try {
      const response = await api.get('/config/status');
      return response.data.data;
    } catch (error) {
      console.error('获取配置状态失败:', error);
      // 返回默认状态
      return {
        twitter: { configured: false, enabled: false },
        kimi: { configured: false, enabled: false }
      };
    }
  }
}

// Twitter API 服务
export class TwitterService {
  private static readonly API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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

  private static transformTwitterResponse(data: any): TwitterSearchResponse {
    const tweets = data.data?.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author_id,
      created_at: tweet.created_at,
      metrics: {
        retweet_count: tweet.public_metrics?.retweet_count || 0,
        like_count: tweet.public_metrics?.like_count || 0,
        reply_count: tweet.public_metrics?.reply_count || 0,
      }
    })) || [];

    return {
      tweets,
      total: data.meta?.result_count || 0
    };
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

      return response.data;
    } catch (error) {
      console.error('Kimi API 调用失败:', error);
      throw new Error('Kimi情绪分析失败，请稍后重试');
    }
  }

  private static parseKimiResponse(content: string): KimiAnalysisResponse {
    try {
      // 尝试提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sentiment: parsed.sentiment || 'neutral',
          score: parsed.score || 0,
          confidence: parsed.confidence || 0.5,
          keywords: parsed.keywords || [],
          analysis: parsed.analysis || content
        };
      }

      // 如果无法解析JSON，则进行简单的文本分析
      return this.fallbackAnalysis(content);
    } catch (error) {
      console.error('解析Kimi响应失败:', error);
      return this.fallbackAnalysis(content);
    }
  }

  private static fallbackAnalysis(content: string): KimiAnalysisResponse {
    const lowerContent = content.toLowerCase();
    
    // 简单的情绪判断
    const positiveWords = ['positive', '积极', '看好', '上涨', '牛市', 'bullish'];
    const negativeWords = ['negative', '消极', '看空', '下跌', '熊市', 'bearish'];
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let score = 0;
    
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      score = Math.min(0.8, 0.3 + positiveCount * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      score = Math.max(-0.8, -0.3 - negativeCount * 0.1);
    }

    return {
      sentiment,
      score,
      confidence: 0.6,
      keywords: [],
      analysis: content
    };
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