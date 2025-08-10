// API配置
export const API_CONFIG = {
  // 基础URL配置
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // Twitter API配置
  TWITTER: {
    SEARCH_ENDPOINT: '/twitter/search',
    MAX_RESULTS: 100,
    DEFAULT_FIELDS: 'created_at,author_id,public_metrics,context_annotations',
  },
  
  // Kimi API配置
  KIMI: {
    ANALYZE_ENDPOINT: '/kimi/analyze',
    TIMEOUT: 30000,
  },
  
  // 请求超时配置
  TIMEOUT: 30000,
  
  // 重试配置
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },
};

// 环境变量配置
export const ENV_CONFIG = {
  // Twitter API密钥（生产环境中应该在后端配置）
  TWITTER_BEARER_TOKEN: import.meta.env.VITE_TWITTER_BEARER_TOKEN,
  
  // Kimi API密钥（生产环境中应该在后端配置）
  KIMI_API_KEY: import.meta.env.VITE_KIMI_API_KEY,
  
  // 开发模式
  IS_DEV: import.meta.env.DEV,
};

// NFT情绪分析特定配置
export const NFT_SENTIMENT_CONFIG = {
  // 默认搜索参数
  DEFAULT_SEARCH: {
    MAX_TWEETS: 100,
    LANGUAGE: 'en',
    EXCLUDE_RETWEETS: true,
  },
  
  // 情绪分析参数
  SENTIMENT: {
    CONFIDENCE_THRESHOLD: 0.6,
    KEYWORDS_LIMIT: 10,
    ANALYSIS_MIN_LENGTH: 100,
  },
  
  // 热门NFT项目列表（用于快速搜索）
  POPULAR_COLLECTIONS: [
    'BAYC',
    'CryptoPunks',
    'Azuki',
    'Doodles',
    'CloneX',
    'Moonbirds',
    'Otherdeeds',
    'Art Blocks',
    'World of Women',
    'Cool Cats'
  ],
};

// API错误消息映射
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TWITTER_API_ERROR: 'Twitter API调用失败，请稍后重试',
  KIMI_API_ERROR: 'Kimi分析服务暂时不可用，请稍后重试',
  NO_DATA_FOUND: '未找到相关数据，请尝试其他关键词',
  RATE_LIMIT_EXCEEDED: 'API调用频率超限，请稍后重试',
  INVALID_QUERY: '搜索关键词无效，请输入有效的NFT项目名称',
  SERVER_ERROR: '服务器内部错误，请联系管理员',
};