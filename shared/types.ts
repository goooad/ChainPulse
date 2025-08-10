// 共享类型定义
export interface RiskLevel {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0-100
  reasons: string[];
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  data: string;
  timestamp: number;
  riskAssessment: RiskLevel;
}

export interface TransactionRisk {
  transactionHash: string;
  level: RiskLevel['level'];
  score: number;
  reasons: string[];
  timestamp: Date;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
}

export type SentimentType = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface SentimentSignal {
  id: string;
  sentiment: SentimentType;
  confidence: number; // 0-1
  reasoning: string;
  source: string;
  timestamp: Date;
  keywords: string[];
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  rawData: any;
}

export interface NFTSentiment {
  collection: string;
  sentiment: SentimentType;
  confidence: number; // 0-1
  reasonChain: string[];
  sources: {
    twitter: number;
    discord: number;
    farcaster: number;
  };
  timestamp: number;
}

export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  prediction: {
    nextHour: number;
    next24h: number;
    confidence: number;
  };
  volatilityIndex: number;
  riskLevel: RiskLevel;
}

export interface AIAnalysis {
  type: 'TRANSACTION' | 'NFT_SENTIMENT' | 'PRICE_PREDICTION';
  result: any;
  confidence: number;
  reasoning: string[];
  timestamp: number;
}

export interface UserSettings {
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  enabledFeatures: {
    transactionFirewall: boolean;
    nftSentiment: boolean;
    priceMonitoring: boolean;
  };
  notifications: {
    highRiskTransactions: boolean;
    sentimentAlerts: boolean;
    priceAlerts: boolean;
  };
}