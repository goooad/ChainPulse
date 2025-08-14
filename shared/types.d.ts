export interface RiskLevel {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    score: number;
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
    confidence: number;
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
    confidence: number;
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
        nftSentiment: boolean;
        priceMonitoring: boolean;
    };
    notifications: {
        highRiskTransactions: boolean;
        sentimentAlerts: boolean;
        priceAlerts: boolean;
    };
}
//# sourceMappingURL=types.d.ts.map