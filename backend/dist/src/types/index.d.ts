export interface TransactionRisk {
    transactionHash: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    score: number;
    reasons: string[];
    timestamp: Date;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
}
export interface RiskLevel {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    color: string;
}
export interface SentimentSignal {
    id: string;
    symbol: string;
    sentiment: SentimentType;
    score: number;
    confidence: number;
    sources: string[];
    timestamp: Date;
    reasoning?: string;
    metadata?: {
        volume?: number;
        mentions?: number;
        influencerScore?: number;
        keywords?: string[];
        impact?: string;
        rawData?: any;
    };
}
export type SentimentType = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
export interface PriceAlert {
    id: string;
    symbol: string;
    type: 'PRICE_SPIKE' | 'PRICE_DROP' | 'VOLUME_SPIKE';
    threshold: number;
    currentValue: number;
    timestamp: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}
//# sourceMappingURL=index.d.ts.map