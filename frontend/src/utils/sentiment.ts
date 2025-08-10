import { NFTSentimentData } from '../types/api';

// 情绪分析工具函数
export class SentimentUtils {
  // 获取情绪颜色类名
  static getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  // 获取情绪图标
  static getSentimentIcon(sentiment: string): string {
    switch (sentiment) {
      case 'positive':
        return '📈';
      case 'negative':
        return '📉';
      case 'neutral':
        return '➖';
      default:
        return '❓';
    }
  }

  // 获取情绪描述
  static getSentimentDescription(sentiment: string): string {
    switch (sentiment) {
      case 'positive':
        return '积极';
      case 'negative':
        return '消极';
      case 'neutral':
        return '中性';
      default:
        return '未知';
    }
  }

  // 格式化情绪得分
  static formatScore(score: number): string {
    return score.toFixed(2);
  }

  // 格式化置信度
  static formatConfidence(confidence: number): string {
    return `${(confidence * 100).toFixed(1)}%`;
  }

  // 获取情绪强度等级
  static getSentimentIntensity(score: number): 'weak' | 'moderate' | 'strong' {
    const absScore = Math.abs(score);
    if (absScore < 0.3) return 'weak';
    if (absScore < 0.7) return 'moderate';
    return 'strong';
  }

  // 获取情绪强度描述
  static getIntensityDescription(intensity: 'weak' | 'moderate' | 'strong'): string {
    switch (intensity) {
      case 'weak':
        return '轻微';
      case 'moderate':
        return '中等';
      case 'strong':
        return '强烈';
    }
  }

  // 生成情绪摘要
  static generateSummary(data: NFTSentimentData): string {
    const sentimentDesc = this.getSentimentDescription(data.sentiment);
    const intensity = this.getSentimentIntensity(data.score);
    const intensityDesc = this.getIntensityDescription(intensity);
    
    return `基于${data.tweetCount}条推文的分析，${data.collection}项目当前呈现${intensityDesc}${sentimentDesc}情绪，置信度为${this.formatConfidence(data.confidence)}。`;
  }

  // 验证情绪数据完整性
  static validateSentimentData(data: any): data is NFTSentimentData {
    return (
      data &&
      typeof data.collection === 'string' &&
      ['positive', 'negative', 'neutral'].includes(data.sentiment) &&
      typeof data.score === 'number' &&
      typeof data.confidence === 'number' &&
      typeof data.tweetCount === 'number' &&
      typeof data.analysis === 'string' &&
      Array.isArray(data.keywords) &&
      typeof data.timestamp === 'string'
    );
  }

  // 计算情绪趋势（需要历史数据）
  static calculateTrend(currentData: NFTSentimentData, previousData?: NFTSentimentData): 'up' | 'down' | 'stable' {
    if (!previousData) return 'stable';
    
    const scoreDiff = currentData.score - previousData.score;
    if (Math.abs(scoreDiff) < 0.1) return 'stable';
    return scoreDiff > 0 ? 'up' : 'down';
  }

  // 生成关键词标签的颜色
  static getKeywordColor(index: number): string {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[index % colors.length];
  }
}

// 时间格式化工具
export class TimeUtils {
  // 格式化时间戳
  static formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 获取相对时间
  static getRelativeTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return this.formatTimestamp(timestamp);
  }
}

// 数据验证工具
export class ValidationUtils {
  // 验证搜索查询
  static validateSearchQuery(query: string): { valid: boolean; message?: string } {
    if (!query || query.trim().length === 0) {
      return { valid: false, message: '请输入搜索关键词' };
    }
    
    if (query.trim().length < 2) {
      return { valid: false, message: '搜索关键词至少需要2个字符' };
    }
    
    if (query.trim().length > 50) {
      return { valid: false, message: '搜索关键词不能超过50个字符' };
    }
    
    // 检查是否包含特殊字符
    const specialChars = /[<>\"'&]/;
    if (specialChars.test(query)) {
      return { valid: false, message: '搜索关键词不能包含特殊字符' };
    }
    
    return { valid: true };
  }

  // 验证API响应
  static validateApiResponse(response: any): { valid: boolean; message?: string } {
    if (!response) {
      return { valid: false, message: 'API响应为空' };
    }
    
    if (response.error) {
      return { valid: false, message: response.error };
    }
    
    return { valid: true };
  }
}