# NFT情绪分析功能

## 功能概述

NFT情绪分析功能通过Twitter API获取相关推文数据，并调用Kimi AI进行情绪分析，为用户提供NFT项目的市场情绪洞察。

## 主要特性

### 1. 实时数据获取
- 通过Twitter API获取最新的NFT相关推文
- 支持关键词和项目名称搜索
- 自动过滤转推和垃圾信息

### 2. AI情绪分析
- 使用Kimi AI进行深度情绪分析
- 提供情绪倾向（积极/消极/中性）
- 计算情绪得分和置信度
- 提取关键词和热点话题

### 3. 可视化展示
- 直观的情绪概览界面
- 情绪得分可视化进度条
- 关键词云展示
- 相关推文列表

### 4. 开发友好
- 支持模拟数据开发
- 完整的TypeScript类型定义
- 错误处理和用户反馈

## 技术架构

```
Frontend (React + TypeScript)
├── Pages/NFTSentiment.tsx          # 主页面组件
├── Services/api.ts                 # API服务层
├── Types/api.ts                    # 类型定义
├── Utils/sentiment.ts              # 工具函数
├── Config/api.ts                   # 配置文件
└── Mocks/api.ts                    # 模拟数据

Backend APIs (需要实现)
├── /api/twitter/search             # Twitter搜索API
└── /api/kimi/analyze              # Kimi分析API
```

## 使用方法

### 1. 基本搜索
1. 在搜索框中输入NFT项目名称或关键词
2. 点击"分析"按钮或按回车键
3. 等待数据获取和分析完成
4. 查看分析结果

### 2. 快速搜索
- 点击热门项目标签快速搜索
- 支持的热门项目：BAYC、CryptoPunks、Azuki等

### 3. 结果解读
- **情绪倾向**：积极/消极/中性
- **情绪得分**：-1到1之间，越接近1越积极
- **置信度**：分析结果的可信度
- **关键词**：提取的重要词汇
- **详细分析**：AI生成的分析报告

## 开发配置

### 环境变量
```bash
# .env.development
VITE_USE_REAL_API=false          # 是否使用真实API
VITE_TWITTER_BEARER_TOKEN=       # Twitter API密钥
VITE_KIMI_API_KEY=              # Kimi API密钥
```

### 模拟数据开发
开发环境下默认使用模拟数据，无需配置真实API密钥：
- 自动生成合理的情绪分析结果
- 模拟网络延迟和真实响应
- 支持不同查询词的差异化结果

### 真实API集成
生产环境需要配置：
1. Twitter API Bearer Token
2. Kimi API密钥
3. 后端API服务

## API接口规范

### Twitter搜索API
```typescript
POST /api/twitter/search
{
  "query": "BAYC NFT",
  "max_results": 100,
  "tweet_fields": "created_at,author_id,public_metrics"
}
```

### Kimi分析API
```typescript
POST /api/kimi/analyze
{
  "texts": ["推文内容1", "推文内容2"],
  "task": "nft_sentiment_analysis",
  "prompt": "分析提示词"
}
```

## 错误处理

系统包含完整的错误处理机制：
- 网络连接错误
- API调用失败
- 数据格式错误
- 用户输入验证

## 性能优化

- 请求防抖处理
- 数据缓存机制
- 分页加载推文
- 响应式设计

## 扩展功能

### 计划中的功能
- [ ] 历史情绪趋势图表
- [ ] 多个项目对比分析
- [ ] 情绪预警通知
- [ ] 导出分析报告
- [ ] 社交媒体平台扩展

### 自定义配置
- 可调整分析参数
- 自定义关键词过滤
- 个性化推荐算法

## 注意事项

1. **API限制**：注意Twitter API的调用频率限制
2. **数据准确性**：AI分析结果仅供参考，不构成投资建议
3. **隐私保护**：不存储用户搜索历史和个人信息
4. **实时性**：数据存在一定延迟，建议结合多个信息源

## 故障排除

### 常见问题
1. **搜索无结果**：检查关键词拼写，尝试更通用的词汇
2. **分析失败**：检查网络连接和API配置
3. **加载缓慢**：可能是API响应延迟，请耐心等待

### 调试模式
开启调试模式查看详细日志：
```bash
VITE_DEBUG_MODE=true