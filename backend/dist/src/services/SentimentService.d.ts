import { SentimentSignal } from '../types';
export declare class SentimentService {
    private isMonitoring;
    private moonshotApiKey;
    private twitterApiKey;
    constructor();
    startMonitoring(): void;
    analyzeNFTSentiment(): Promise<SentimentSignal[]>;
    analyzeMarketSentiment(): Promise<SentimentSignal[]>;
    private getTwitterData;
    private getDiscordData;
    private getFarcasterData;
    private getMarketData;
    private analyzeSentimentWithMoonshot;
    private saveSentimentSignals;
    getSentimentHistory(timeRange?: string): Promise<SentimentSignal[]>;
    stopMonitoring(): void;
}
//# sourceMappingURL=SentimentService.d.ts.map