// 开发环境下的API模拟数据
import { TwitterSearchResponse, KimiAnalysisResponse } from '../types/api';

// 模拟Twitter数据
export const mockTwitterData: TwitterSearchResponse = {
  tweets: [
    {
      id: '1',
      text: 'BAYC floor price is pumping! 🚀 This collection never disappoints. #BAYC #NFT',
      author: 'nft_trader_1',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
      metrics: {
        retweet_count: 45,
        like_count: 128,
        reply_count: 23
      }
    },
    {
      id: '2',
      text: 'Not sure about BAYC anymore... prices are too volatile and the roadmap seems unclear 😕',
      author: 'crypto_skeptic',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
      metrics: {
        retweet_count: 12,
        like_count: 34,
        reply_count: 67
      }
    },
    {
      id: '3',
      text: 'BAYC community is still strong! Great utility and amazing art. Holding for long term 💎🙌',
      author: 'diamond_hands',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4小时前
      metrics: {
        retweet_count: 89,
        like_count: 256,
        reply_count: 45
      }
    },
    {
      id: '4',
      text: 'BAYC partnership with major brands is bullish! This is just the beginning 🔥',
      author: 'nft_bull',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6小时前
      metrics: {
        retweet_count: 156,
        like_count: 423,
        reply_count: 78
      }
    },
    {
      id: '5',
      text: 'BAYC gas fees are killing me... maybe it\'s time to look at other chains 😤',
      author: 'gas_victim',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8小时前
      metrics: {
        retweet_count: 23,
        like_count: 67,
        reply_count: 34
      }
    }
  ],
  total: 1247
};

// 模拟Kimi分析结果
export const mockKimiAnalysis: KimiAnalysisResponse = {
  sentiment: 'positive',
  score: 0.65,
  confidence: 0.82,
  analysis: `基于对相关推文的深度分析，该NFT项目当前呈现积极的市场情绪。

**积极因素：**
- 社区活跃度较高，持有者信心较强
- 品牌合作和实用性获得认可
- 长期持有者比例较高，显示市场信心

**关注点：**
- 价格波动性较大，短期投机情绪存在
- Gas费用问题影响用户体验
- 部分用户对项目路线图存在疑虑

**总体评估：**
尽管存在一些技术和市场挑战，但项目的基本面依然稳固，社区支持度较高。建议关注项目方的后续发展规划和技术优化措施。`,
  keywords: ['BAYC', '价格上涨', '社区', '品牌合作', '长期持有', 'Gas费用', '波动性', '路线图']
};

// API模拟服务
export class MockApiService {
  // 模拟网络延迟
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 模拟Twitter搜索
  static async mockTwitterSearch(query: string): Promise<TwitterSearchResponse> {
    await this.delay(1500); // 模拟网络延迟
    
    // 根据查询词生成不同的模拟数据
    const baseData = { ...mockTwitterData };
    baseData.tweets = baseData.tweets.map(tweet => ({
      ...tweet,
      text: tweet.text.replace(/BAYC/g, query.toUpperCase())
    }));
    
    return baseData;
  }

  // 模拟Kimi分析
  static async mockKimiAnalysis(texts: string[], collection: string): Promise<KimiAnalysisResponse> {
    await this.delay(2000); // 模拟分析时间
    
    // 简单的情绪分析模拟
    const positiveWords = ['pump', 'bullish', 'strong', 'great', 'amazing', 'partnership', '🚀', '💎', '🔥'];
    const negativeWords = ['dump', 'bearish', 'weak', 'bad', 'terrible', 'scam', '😕', '😤', '📉'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    texts.forEach(text => {
      const lowerText = text.toLowerCase();
      positiveWords.forEach(word => {
        if (lowerText.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (lowerText.includes(word)) negativeCount++;
      });
    });
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    let score: number;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      score = Math.min(0.8, 0.3 + (positiveCount - negativeCount) * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      score = Math.max(-0.8, -0.3 - (negativeCount - positiveCount) * 0.1);
    } else {
      sentiment = 'neutral';
      score = 0;
    }
    
    return {
      sentiment,
      score,
      confidence: 0.75 + Math.random() * 0.2, // 0.75-0.95之间的随机置信度
      analysis: mockKimiAnalysis.analysis.replace(/该NFT项目/g, `${collection}项目`),
      keywords: [...mockKimiAnalysis.keywords.slice(1), collection] // 替换第一个关键词为查询词
    };
  }
}

// 开发环境检测
export const isDevelopment = import.meta.env.DEV;

// 是否使用模拟数据 - 根据用户要求，不使用模拟数据
export const useMockData = false;

// 调试信息
console.log('Environment check:', {
  isDevelopment,
  VITE_USE_REAL_API: import.meta.env.VITE_USE_REAL_API,
  VITE_TWITTER_BEARER_TOKEN: import.meta.env.VITE_TWITTER_BEARER_TOKEN ? '已配置' : '未配置',
  VITE_KIMI_API_KEY: import.meta.env.VITE_KIMI_API_KEY ? '已配置' : '未配置',
  useMockData: false, // 强制使用真实API
  message: '已配置API密钥，使用真实API服务'
});
