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
        max_results: params.max_results || 10,
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

  static async getTweetsByKeyword(keyword: string, maxResults: number = 10): Promise<TwitterSearchResponse> {
    return this.searchTweets({
      query: keyword,
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

      // 处理 Kimi API 的响应格式
      let analysisResult;
      
      if (response.data.data) {
        // 如果后端已经解析了 JSON，直接使用
        analysisResult = response.data.data;
        
        // 确保所有必需字段都存在
        analysisResult = {
          sentiment: analysisResult.sentiment || 'neutral',
          score: Number(analysisResult.score) || 0,
          confidence: Number(analysisResult.confidence) || 0.5,
          keywords: Array.isArray(analysisResult.keywords) ? analysisResult.keywords : [],
          analysis: analysisResult.analysis || '分析完成'
        };
        
        // 如果返回的是字符串，尝试解析JSON
        if (typeof analysisResult === 'string') {
          try {
            // 提取JSON部分
            const jsonMatch = (analysisResult as string).match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              analysisResult = JSON.parse(jsonMatch[0]);
            } else {
              // 如果没有找到JSON，返回默认结果
              analysisResult = {
                sentiment: 'neutral',
                score: 0,
                confidence: 0.5,
                keywords: ['分析中'],
                analysis: '分析结果解析失败，请重试'
              };
            }
          } catch (parseError) {
            console.error('JSON解析失败:', parseError);
            analysisResult = {
              sentiment: 'neutral',
              score: 0,
              confidence: 0.5,
              keywords: ['分析中'],
              analysis: '分析结果解析失败，请重试'
            };
          }
        }
        
        // 过滤掉不需要的提示文本
        if (analysisResult.analysis && typeof analysisResult.analysis === 'string') {
          if (analysisResult.analysis.includes('请提供至少1000字的深度分析') || 
              analysisResult.analysis.includes('详细分析报告 - 请提供')) {
            analysisResult.analysis = '正在生成详细分析报告，请稍候...';
          }
        }
        
      } else if (response.data.sentiment) {
        // 如果数据直接在 response.data 中
        analysisResult = {
          sentiment: response.data.sentiment,
          score: response.data.score,
          confidence: response.data.confidence,
          keywords: response.data.keywords,
          analysis: response.data.analysis
        };
      } else {
        throw new Error('Kimi API 响应格式不正确');
      }

      return analysisResult;
    } catch (error: any) {
      console.error('Kimi API 调用失败:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Kimi情绪分析失败，请稍后重试');
      }
    }
  }



  static async analyzeNFTSentiment(tweets: string[], collection: string): Promise<KimiAnalysisResponse> {
    const prompt = `请对以下关于NFT项目"${collection}"的Twitter推文数据进行深度情绪分析：

## 分析目标
NFT项目: ${collection}
推文总数: ${tweets.length}
分析样本: ${Math.min(tweets.length, 20)} 条推文

## 推文内容详细数据
${tweets.slice(0, 20).map((tweet, index) => {
  return `${index + 1}. "${tweet}"`;
}).join('\n\n')}

## 分析维度要求

### 1. 整体情绪判断
- 基于推文内容的情绪倾向分析
- 识别情绪的强度和一致性
- 考虑隐含的市场预期

### 2. 市场信号分析
- 价格相关讨论（涨跌预期、价值判断、支撑阻力）
- 交易活跃度信号（买入、卖出、持有意向、FOMO情绪）
- 项目发展动态（新功能、合作伙伴、路线图更新、团队动态）
- 社区活跃度（用户参与度、讨论热度、社区建设）

### 3. 风险因素识别
- 负面情绪的具体原因和严重程度
- 市场担忧和质疑声音（技术风险、监管风险、流动性风险）
- 竞争对手影响和市场地位变化
- 宏观环境对项目的潜在影响

### 4. 机会点发现
- 积极信号和看涨因素分析
- 社区支持度和用户忠诚度评估
- 创新亮点和差异化竞争优势
- 市场机会和增长潜力评估

### 5. 技术面分析
- 链上数据相关讨论（交易量、持有者数量、地板价）
- 技术指标和图表分析相关内容
- 市场流动性和深度分析

### 6. 基本面分析
- 项目团队和背景评价
- 商业模式和盈利能力讨论
- 合作伙伴和生态系统建设
- 长期价值和发展前景

请返回以下JSON格式的深度分析结果：
{
  "sentiment": "positive/negative/neutral",
  "score": 数值(-1到1之间，-1最负面，1最正面),
  "confidence": 置信度(0到1之间),
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "analysis": "详细分析报告 - 请提供至少1000字的深度分析，包含以下结构：\n\n## 📊 整体情绪概况\n[基于推文内容的整体情绪判断，包括情绪分布、强度分析、一致性评估]\n\n## 🔍 市场信号解读\n[价格预期分析、交易意向统计、项目发展动态解读、社区活跃度评估]\n\n## ⚠️ 风险因素评估\n[负面因素详细分析、潜在风险识别、市场担忧点梳理、竞争环境分析]\n\n## 🚀 机会点识别\n[积极因素挖掘、增长潜力评估、竞争优势分析、市场机会识别]\n\n## 📈 技术面洞察\n[链上数据讨论、技术指标分析、流动性评估、价格走势预期]\n\n## 🏗️ 基本面分析\n[项目基本面评估、团队背景分析、商业模式评价、长期价值判断]\n\n## 🎯 关键词深度解读\n[重要关键词的深层含义分析、市场情绪指标、热点话题解读]\n\n## 💡 投资策略建议\n[基于分析的具体操作建议、风险控制措施、时机把握要点、仓位管理建议]\n\n## 📋 总结与展望\n[核心观点总结、短期和长期展望、关键关注点提醒]"
}

分析要求：
1. sentiment必须准确反映主流情绪倾向，综合考虑正面、负面、中性内容的权重
2. score要基于内容深度分析，考虑情绪强度、市场预期、风险收益比
3. confidence基于样本质量、情绪一致性、信息可靠性进行评估
4. keywords选择最具代表性和分析价值的词汇，体现市场关注焦点
5. analysis必须专业、详细、有条理，为用户提供实用的投资决策参考

请基于以上完整数据进行专业的NFT市场情绪分析，确保分析报告具有实际指导价值。`;

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

// 地址分析服务
export class AddressService {
  static async analyzeAddress(address: string): Promise<{
    address: string;
    ethTransactions: any[];
    tokenTransactions: any[];
    analysis: {
      totalEthVolume: number;
      totalTokenTransfers: number;
      mostActiveTokens: any[];
      transactionPattern: string;
      riskLevel: string;
      insights: string[];
    };
    kimiAnalysis: string;
  }> {
    try {
      console.log('开始分析地址:', address);
      
      const response = await api.post('/address/analyze', { address });
      
      if (!response.data.success) {
        throw new Error(response.data.error || '地址分析失败');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('地址分析失败:', error);
      
      if (error.response?.status === 400) {
        throw new Error('无效的以太坊地址格式');
      } else if (error.response?.status === 429) {
        throw new Error('API调用频率过高，请稍后重试');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('地址分析失败，请检查网络连接或稍后重试');
      }
    }
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