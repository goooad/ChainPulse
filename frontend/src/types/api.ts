// Twitter API 相关类型
export interface TwitterSearchParams {
  query: string;
  max_results?: number;
  tweet_fields?: string;
}

export interface TwitterTweet {
  id: string;
  text: string;
  author: string;
  created_at: string;
  metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
  };
}

export interface TwitterSearchResponse {
  tweets: TwitterTweet[];
  total: number;
}

// Kimi API 相关类型
export interface KimiAnalysisParams {
  texts: string[];
  task: string;
  prompt: string;
}

export interface KimiAnalysisResponse {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  analysis: string;
  keywords: string[];
}

// NFT情绪分析相关类型
export interface NFTSentimentData {
  collection: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  tweetCount: number;
  analysis: string;
  keywords: string[];
  timestamp: string;
}