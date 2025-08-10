# Web3Sentry 部署指南

## 项目概述

Web3Sentry是一个集成"链上行为防火墙 + NFT情绪预测 + 主流币种波动监控"的Web3安全防护平台。

## 核心功能

### 1. 链上行为防火墙 🛡️
- 实时拦截Web3交易、授权、签名
- AI风险评估和智能拦截
- 恶意合约检测
- 异常交易监控

### 2. NFT情绪预测 📊
- 基于Claude-3.5 LLM分析社交媒体数据
- Twitter、Discord、Farcaster情绪挖掘
- 结构化情绪信号输出（BULLISH/BEARISH + 置信度）
- 实时情绪趋势监控

### 3. 主流币种波动监控 📈
- 实时价格监控和预测
- 高阶波动分析
- 智能预警系统
- 风险评估报告

## 技术架构

```
Web3Sentry/
├── frontend/          # React + TypeScript 前端
├── backend/           # Node.js + Express 后端
├── extension/         # Chrome浏览器扩展
├── shared/           # 共享类型定义
└── docs/             # 文档
```

## 快速启动

### 1. 环境要求
- Node.js 18+
- npm 或 yarn
- Chrome浏览器

### 2. 安装依赖
```bash
# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd ../backend && npm install
```

### 3. 环境变量配置
创建 `backend/.env` 文件：
```env
# API密钥
MOONSHOT_API_KEY=your_moonshot_api_key
TWITTER_API_KEY=your_twitter_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# 区块链RPC
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_key
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_key

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/web3sentry

# 服务配置
PORT=3001
NODE_ENV=development
```

### 4. 启动服务
```bash
# 方式1: 使用启动脚本
chmod +x start.sh
./start.sh

# 方式2: 手动启动
# 终端1 - 启动后端
cd backend && npm run dev

# 终端2 - 启动前端
cd frontend && npm run dev
```

### 5. 安装浏览器扩展
1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目中的 `extension` 文件夹

## 服务地址

- 🌐 前端界面: http://localhost:5173
- 🔧 后端API: http://localhost:3001
- 🛡️ 浏览器扩展: Chrome扩展栏

## API接口

### 防火墙API
```
GET  /api/firewall/risks     # 获取风险交易历史
POST /api/firewall/analyze   # 分析特定交易
GET  /api/firewall/status    # 获取防火墙状态
```

### 情绪分析API
```
GET  /api/sentiment/signals  # 获取情绪信号
POST /api/sentiment/analyze  # 分析特定内容
GET  /api/sentiment/history  # 获取历史数据
```

### 价格监控API
```
GET  /api/price/monitor      # 获取监控列表
POST /api/price/predict      # 价格预测
GET  /api/price/alerts       # 获取价格预警
```

## 开发指南

### 前端开发
```bash
cd frontend
npm run dev     # 开发模式
npm run build   # 构建生产版本
npm run preview # 预览构建结果
```

### 后端开发
```bash
cd backend
npm run dev     # 开发模式
npm run build   # 构建TypeScript
npm start       # 生产模式
```

### 扩展开发
1. 修改 `extension/` 目录下的文件
2. 在Chrome扩展管理页面点击"重新加载"
3. 测试扩展功能

## 部署到生产环境

### 1. 前端部署
```bash
cd frontend
npm run build
# 将dist目录部署到CDN或静态服务器
```

### 2. 后端部署
```bash
cd backend
npm run build
npm start
# 或使用PM2: pm2 start dist/index.js
```

### 3. 扩展发布
1. 打包extension目录为zip文件
2. 上传到Chrome Web Store
3. 等待审核通过

## 监控和日志

### 应用监控
- 前端: 使用Sentry或类似服务
- 后端: 集成Winston日志和健康检查
- 扩展: Chrome扩展错误监控

### 性能优化
- 前端: 代码分割、懒加载
- 后端: 缓存、数据库优化
- 扩展: 减少内存占用

## 安全考虑

1. **API安全**: 使用HTTPS、API密钥管理
2. **数据加密**: 敏感数据加密存储
3. **权限控制**: 最小权限原则
4. **输入验证**: 严格的输入验证和清理

## 故障排除

### 常见问题
1. **端口冲突**: 修改.env中的PORT配置
2. **API密钥错误**: 检查环境变量配置
3. **扩展权限**: 确保manifest.json权限正确
4. **CORS错误**: 检查后端CORS配置

### 日志查看
```bash
# 后端日志
cd backend && npm run dev

# 前端日志
浏览器开发者工具 -> Console

# 扩展日志
Chrome -> 扩展管理 -> Web3Sentry -> 错误
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

## 许可证

MIT License - 详见LICENSE文件

## 联系方式

- 项目地址: https://github.com/your-username/web3-sentry
- 问题反馈: https://github.com/your-username/web3-sentry/issues
- 邮箱: your-email@example.com