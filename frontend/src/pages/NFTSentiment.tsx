import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Activity, Twitter, Brain, AlertCircle, Clock, Heart } from 'lucide-react';
import { NFTSentimentService, ConfigService } from '../services/api';
import { NFTSentimentData, TwitterSearchResponse } from '../types/api';
import { SentimentUtils, TimeUtils, ValidationUtils } from '../utils/sentiment';
import { NFT_SENTIMENT_CONFIG } from '../config/api';

const NFTSentiment: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState<NFTSentimentData | null>(null);
  const [twitterData, setTwitterData] = useState<TwitterSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API配置状态检查 - 从后端获取
  const [apiStatus, setApiStatus] = useState({
    twitter: { configured: false, enabled: false },
    kimi: { configured: false, enabled: false },
    useRealApi: import.meta.env.VITE_USE_REAL_API !== 'false'
  });

  // 获取API配置状态
  React.useEffect(() => {
    const fetchConfigStatus = async () => {
      try {
        const configStatus = await ConfigService.getStatus();
        setApiStatus(prev => ({
          ...prev,
          twitter: configStatus.twitter,
          kimi: configStatus.kimi
        }));
      } catch (error) {
        console.error('获取配置状态失败:', error);
      }
    };
    fetchConfigStatus();
  }, []);

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
      {/* 页面标题 - 更加醒目 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
            NFT 情绪分析
          </h1>
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xl font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 px-8 py-4 rounded-2xl shadow-lg inline-block border-2 border-gray-300">
            🚀 基于 Twitter 数据分析 NFT 项目的市场情绪 📊
          </p>
        </div>
      </div>

      {/* 搜索区域 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入NFT项目名称或关键词..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black font-semibold text-lg"
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
                <div className={`w-2 h-2 rounded-full ${apiStatus.twitter.configured ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={apiStatus.twitter.configured ? 'text-green-700' : 'text-red-700'}>
                  Twitter: ✅ 已配置 - {apiStatus.twitter.enabled ? '真实API' : '模拟API'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${apiStatus.kimi.configured ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={apiStatus.kimi.configured ? 'text-green-700' : 'text-red-700'}>
                  Kimi: ✅ 已配置 - {apiStatus.kimi.enabled ? '真实API' : '模拟API'}
                </span>
              </div>
            </div>
          </div>
          {(!apiStatus.twitter.configured || !apiStatus.kimi.configured) && apiStatus.useRealApi && (
            <div className="mt-2 text-sm text-orange-600">
              ⚠️ 需要配置API密钥才能使用真实数据，请查看设置页面进行配置
            </div>
          )}
        </div>
        
        {/* 热门项目快速选择 */}
        <div className="flex flex-wrap gap-3">
          <span className="text-sm font-medium text-gray-700 mr-2 flex items-center">🔥 热门项目:</span>
          {NFT_SENTIMENT_CONFIG.POPULAR_COLLECTIONS.slice(0, 6).map((collection) => (
            <button
              key={collection}
              onClick={() => setSearchQuery(collection)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                searchQuery === collection 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:shadow-md hover:transform hover:scale-105'
              }`}
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
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              情绪概览
            </h3>
            <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border-2 shadow-lg transform hover:scale-105 transition-all duration-200 ${SentimentUtils.getSentimentColor(sentimentData.sentiment)} font-bold text-lg`}>
              <div className="text-2xl">
                {getSentimentIcon(sentimentData.sentiment)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">
                  {SentimentUtils.getSentimentDescription(sentimentData.sentiment)}
                </span>
                <span className="text-sm opacity-80">
                  {SentimentUtils.getIntensityDescription(SentimentUtils.getSentimentIntensity(sentimentData.score))}
                </span>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">情绪得分:</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${sentimentData.score >= 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                      style={{ width: `${Math.abs(sentimentData.score) * 50 + 50}%` }}
                    />
                  </div>
                  <span className="font-bold text-lg">{SentimentUtils.formatScore(sentimentData.score)}</span>
                </div>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">置信度:</span>
                <span className="font-bold text-lg text-blue-600">{SentimentUtils.formatConfidence(sentimentData.confidence)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">推文数量:</span>
                <span className="font-bold text-lg text-purple-600">{sentimentData.tweetCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">分析时间:</span>
                <span className="font-medium text-sm flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  {TimeUtils.getRelativeTime(sentimentData.timestamp)}
                </span>
              </div>
            </div>
          </div>

          {/* 关键词 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              关键词分析
            </h3>
            <div className="flex flex-wrap gap-3">
              {sentimentData.keywords.slice(0, NFT_SENTIMENT_CONFIG.SENTIMENT.KEYWORDS_LIMIT).map((keyword, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${SentimentUtils.getKeywordColor(index)} border-2`}
                >
                  #{keyword}
                </span>
              ))}
            </div>
            {sentimentData.keywords.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-500 font-medium">暂无关键词数据</p>
              </div>
            )}
          </div>

          {/* Twitter数据统计 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg">
                <Twitter className="w-6 h-6 text-white" />
              </div>
              数据来源
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <span className="text-gray-700 font-medium">总推文:</span>
                <span className="font-bold text-xl text-blue-600">{twitterData?.total || 0}</span>
              </div>
              <div className="flex justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <span className="text-gray-700 font-medium">分析时间:</span>
                <span className="font-medium text-sm text-purple-600">
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
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-xl border-2 border-purple-200 p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            📊 详细分析报告
          </h3>
          <div className="prose max-w-none">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-l-8 border-purple-500 shadow-lg">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-lg font-medium">
                {sentimentData.analysis}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 推文列表 */}
      {twitterData && (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl border-2 border-blue-200 p-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <Twitter className="w-7 h-7 text-white" />
            </div>
            🐦 相关推文 
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-bold text-xl shadow-lg">
              ({twitterData.total.toLocaleString()} 条)
            </span>
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
