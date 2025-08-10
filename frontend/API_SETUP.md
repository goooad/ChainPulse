# NFT情绪分析 API 配置指南

## 概述

NFT情绪分析功能需要配置Twitter API和Kimi API来获取真实数据。本文档将指导您完成API配置。

## 🔧 环境变量配置

### 1. 复制环境变量文件

```bash
cp .env.example .env.local
```

### 2. 编辑 `.env.local` 文件

```env
# Twitter API配置
VITE_TWITTER_BEARER_TOKEN=your_actual_twitter_bearer_token

# Kimi API配置  
VITE_KIMI_API_KEY=your_actual_kimi_api_key

# 启用真实API
VITE_USE_REAL_API=true
```

## 📱 Twitter API 配置

### 获取 Twitter Bearer Token

1. 访问 [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. 创建开发者账户（如果还没有）
3. 创建新的App项目
4. 在App设置中找到 "Keys and tokens"
5. 生成 "Bearer Token"
6. 将Token复制到环境变量 `VITE_TWITTER_BEARER_TOKEN`

### Twitter API 权限要求

- **Essential access**: 免费，每月50万条推文
- **Elevated access**: 免费，每月200万条推文
- 推荐申请 Elevated access 以获得更好的使用体验

## 🤖 Kimi API 配置

### 获取 Kimi API Key

1. 访问 [Moonshot AI 平台](https://platform.moonshot.cn/)
2. 注册并登录账户
3. 进入 [API Keys 管理页面](https://platform.moonshot.cn/console/api-keys)
4. 创建新的API Key
5. 将API Key复制到环境变量 `VITE_KIMI_API_KEY`

### Kimi API 定价

- 新用户通常有免费额度
- 按Token使用量计费
- 详细定价请查看官方文档

## 🚀 启动应用

配置完成后，重启开发服务器：

```bash
npm run dev
```

## 🧪 测试功能

1. 访问 NFT情绪分析页面
2. 输入NFT项目名称（如：BAYC、CryptoPunks、Azuki）
3. 点击"开始分析"
4. 查看情绪分析结果

## 🔍 故障排除

### 常见错误

1. **Twitter API 401错误**
   - 检查Bearer Token是否正确
   - 确认Token有效期未过期

2. **Twitter API 429错误**
   - API请求频率超限
   - 等待一段时间后重试

3. **Kimi API错误**
   - 检查API Key是否正确
   - 确认账户余额充足

4. **CORS错误**
   - 这是浏览器安全限制
   - 在生产环境中需要通过后端代理API请求

### 开发模式

如果暂时无法配置API，可以使用模拟数据：

```env
VITE_USE_REAL_API=false
```

## 📝 注意事项

1. **安全性**: 不要将API密钥提交到版本控制系统
2. **费用控制**: 监控API使用量，避免意外费用
3. **频率限制**: 遵守API提供商的频率限制
4. **数据隐私**: 确保遵守相关数据保护法规

## 🔗 相关链接

- [Twitter API 文档](https://developer.twitter.com/en/docs/twitter-api)
- [Moonshot AI 文档](https://platform.moonshot.cn/docs)
- [项目GitHub仓库](https://github.com/your-repo)

## 💡 提示

- 建议先在开发环境测试API配置
- 可以设置API使用量监控和告警
- 定期检查API密钥的安全性