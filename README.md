# Web3Sentry之ChainPulse

NFT情绪预测 + 链上地址分析

## 🚀 功能特性

### 📊 NFT情绪预测
- 基于Claude-3.5的语义级情绪分析
- 多平台数据源：Twitter、Farcaster、Discord
- 结构化信号输出：BULLISH/BEARISH + 置信度 + 原因链

### 📈 链上地址分析
- 高阶波动监控
- 价格预测算法
- 实时风险评估

## 🏗️ 项目结构

```
Web3-Sentry/
├── frontend/          # React前端应用
├── backend/           # Node.js后端API
├── extension/         # Chrome浏览器扩展
├── shared/           # 共享类型和工具
└── docs/             # 项目文档
```

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript + Vite + TailwindCSS
- **后端**: Node.js + Express + TypeScript
- **区块链**: Ethers.js + Web3.js
- **AI**: Claude-3.5 API
- **数据源**: Twitter API + 链上RPC
- **扩展**: Chrome Extension Manifest V3

## 🚀 快速开始

1. 安装依赖
```bash
npm run install:all
```

2. 启动开发环境
```bash
npm run dev
```

3. 构建项目
```bash
npm run build
```

## 📝 环境配置

创建 `.env` 文件：
```
CLAUDE_API_KEY=your_claude_api_key
TWITTER_API_KEY=your_twitter_api_key
ETHEREUM_RPC_URL=your_ethereum_rpc_url
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License