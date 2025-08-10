import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Activity, Twitter, Brain, AlertCircle, Clock } from 'lucide-react';
import { NFTSentimentService } from '../services/api';
import { NFTSentimentData, TwitterSearchResponse } from '../types/api';
import { SentimentUtils, TimeUtils, ValidationUtils } from '../utils/sentiment';
import { NFT_SENTIMENT_CONFIG } from '../config/api';

const NFTSentiment: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState<NFTSentimentData | null>(null);
  const [twitterData, setTwitterData] = useState<TwitterSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API配置状态检查
  const apiStatus = {
    twitter: !!import.meta.env.VITE_TWITTER_BEARER_TOKEN,
    kimi: !!import.meta.env.VITE_KIMI_API_KEY,
    useRealApi: import.meta.env.VITE_USE_REAL_API === 'true'
  };

  const handleSearch = async () => {
    // 验证搜索查询
    const validation = ValidationUtils.validateSearchQuery(searchQuery);
    if (!validation.valid) {
      setError(validation.message || '搜索关键词无效');
      return;
    }

    setLoading(true);
    setError(null);
    setSentimentData(null);
    setTwitterData(null);

    try {
      // 使用NFTSentimentService进行综合分析
      const result = await NFTSentimentService.analyzeSentiment(searchQuery.trim());
      
      setTwitterData(result.twitterData);

      // 构建情绪数据
      const sentiment: NFTSentimentData = {
        collection: searchQuery.trim(),
        sentiment: result.sentimentAnalysis.sentiment,
        score: result.sentimentAnalysis.score,
        confidence: result.sentimentAnalysis.confidence,
        tweetCount: result.twitterData.total,
        analysis: result.sentimentAnalysis.analysis,
        keywords: result.sentimentAnalysis.keywords,
        timestamp: new Date().toISOString()
      };

      // 验证数据完整性
      if (!SentimentUtils.validateSentimentData(sentiment)) {
        throw new Error('分析结果数据不完整');
      }

      setSentimentData(sentiment);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-5 h-5" />;
      case 'negative': return <TrendingDown className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">NFT 情绪分析</h1>

      {/* 搜索区域 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入NFT项目名称或关键词..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? '分析中...' : '分析'}
          </button>
        </div>
        
        {/* API配置状态提示 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">API配置状态:</span>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${apiStatus.twitter ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={apiStatus.twitter ? 'text-green-700' : 'text-red-700'}>
                  Twitter {apiStatus.twitter ? '已配置' : '未配置'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${apiStatus.kimi ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={apiStatus.kimi ? 'text-green-700' : 'text-red-700'}>
                  Kimi {apiStatus.kimi ? '已配置' : '未配置'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${apiStatus.useRealApi ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                <span className={apiStatus.useRealApi ? 'text-blue-700' : 'text-yellow-700'}>
                  {apiStatus.useRealApi ? '真实API' : '模拟数据'}
                </span>
              </div>
            </div>
          </div>
          {(!apiStatus.twitter || !apiStatus.kimi) && apiStatus.useRealApi && (
            <div className="mt-2 text-sm text-orange-600">
              ⚠️ 需要配置API密钥才能使用真实数据，请查看 <code className="bg-orange-100 px-1 rounded">API_SETUP.md</code> 文档
            </div>
          )}
        </div>
        
        {/* 热门项目快速选择 */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-2">热门项目:</span>
          {NFT_SENTIMENT_CONFIG.POPULAR_COLLECTIONS.slice(0, 6).map((collection) => (
            <button
              key={collection}
              onClick={() => setSearchQuery(collection)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {collection}
            </button>
          ))}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* 分析结果 */}
      {sentimentData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 情绪概览 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              情绪概览
            </h3>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${SentimentUtils.getSentimentColor(sentimentData.sentiment)}`}>
              {getSentimentIcon(sentimentData.sentiment)}
              <span className="font-medium">
                {SentimentUtils.getSentimentDescription(sentimentData.sentiment)}
              </span>
              <span className="text-sm">
                ({SentimentUtils.getIntensityDescription(SentimentUtils.getSentimentIntensity(sentimentData.score))})
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">情绪得分:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${sentimentData.score >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.abs(sentimentData.score) * 50 + 50}%` }}
                    />
                  </div>
                  <span className="font-medium">{SentimentUtils.formatScore(sentimentData.score)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">置信度:</span>
                <span className="font-medium">{SentimentUtils.formatConfidence(sentimentData.confidence)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">推文数量:</span>
                <span className="font-medium">{sentimentData.tweetCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">分析时间:</span>
                <span className="font-medium text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {TimeUtils.getRelativeTime(sentimentData.timestamp)}
                </span>
              </div>
            </div>
          </div>

          {/* 关键词 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">关键词分析</h3>
            <div className="flex flex-wrap gap-2">
              {sentimentData.keywords.slice(0, NFT_SENTIMENT_CONFIG.SENTIMENT.KEYWORDS_LIMIT).map((keyword, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${SentimentUtils.getKeywordColor(index)}`}
                >
                  {keyword}
                </span>
              ))}
            </div>
            {sentimentData.keywords.length === 0 && (
              <p className="text-gray-500 text-sm">暂无关键词数据</p>
            )}
          </div>

          {/* Twitter数据统计 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Twitter className="w-5 h-5 text-blue-500" />
              数据来源
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">总推文:</span>
                <span className="font-medium">{twitterData?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">分析时间:</span>
                <span className="font-medium text-sm">
                  {new Date(sentimentData.timestamp).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 情绪摘要 */}
      {sentimentData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">分析摘要</h3>
          <p className="text-blue-800 leading-relaxed">
            {SentimentUtils.generateSummary(sentimentData)}
          </p>
        </div>
      )}

      {/* 详细分析 */}
      {sentimentData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">详细分析报告</h3>
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {sentimentData.analysis}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 推文列表 */}
      {twitterData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Twitter className="w-5 h-5 text-blue-500" />
            相关推文 ({twitterData.total.toLocaleString()} 条)
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {twitterData.tweets.slice(0, 10).map((tweet) => (
              <div key={tweet.id} className="border-l-4 border-blue-200 pl-4 py-3 hover:bg-gray-50 transition-colors">
                <p className="text-gray-800 mb-3 leading-relaxed">{tweet.text}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-medium">@{tweet.author}</span>
                  <span>{TimeUtils.formatTimestamp(tweet.created_at)}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      ❤️ {tweet.metrics.like_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      🔄 {tweet.metrics.retweet_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {tweet.metrics.reply_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {twitterData.tweets.length > 10 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  显示前10条推文，共{twitterData.total.toLocaleString()}条
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTSentiment;
