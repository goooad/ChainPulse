import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

// 确保正确加载.env文件
dotenv.config({ path: path.join(__dirname, '../.env') })

// 验证环境变量加载
console.log('🔑 [启动] 环境变量检查:')
console.log('  - ETHERSCAN_API_KEY:', process.env.ETHERSCAN_API_KEY ? '已加载' : '未加载')
console.log('  - HTTPS_PROXY:', process.env.HTTPS_PROXY ? '已配置' : '未配置')

// 导入路由
import sentimentRoutes from './routes/sentiment'
import addressRoutes from './routes/address'
import settingsRoutes from './routes/settings'
import twitterRoutes from './routes/twitter'
import kimiRoutes from './routes/kimi'

// 导入服务
import { SentimentService } from './services/SentimentService'
import { WebSocketService } from './services/WebSocketService'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

// 中间件
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    process.env.CORS_ORIGIN || 'http://localhost:3000'
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/sentiment', sentimentRoutes)
app.use('/api/address', addressRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/twitter', twitterRoutes)
app.use('/api/kimi', kimiRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 配置状态检查接口
app.get('/api/config/status', (req, res) => {
  const twitterConfigured = !!(process.env.TWITTER_BEARER_TOKEN && process.env.TWITTER_BEARER_TOKEN.trim() !== '');
  const kimiConfigured = !!(process.env.MOONSHOT_API_KEY && process.env.MOONSHOT_API_KEY.trim() !== '');
  
  console.log('配置状态检查:', {
    TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN ? `已设置(${process.env.TWITTER_BEARER_TOKEN.substring(0, 20)}...)` : '未设置',
    MOONSHOT_API_KEY: process.env.MOONSHOT_API_KEY ? `已设置(${process.env.MOONSHOT_API_KEY.substring(0, 20)}...)` : '未设置',
    twitterConfigured,
    kimiConfigured
  });
  
  const config = {
    twitter: {
      configured: twitterConfigured,
      enabled: process.env.USE_REAL_TWITTER_API === 'true'
    },
    kimi: {
      configured: kimiConfigured,
      enabled: process.env.USE_REAL_KIMI_API === 'true'
    }
  };
  
  res.json({
    success: true,
    data: config
  });
})

// WebSocket服务
const wsService = new WebSocketService(wss)

// 启动服务
const sentimentService = new SentimentService()

// 启动实时监控
//sentimentService.startMonitoring()

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Web3Sentry后端服务启动成功`)
  console.log(`📡 HTTP服务: http://localhost:${PORT}`)
  console.log(`🔌 WebSocket服务: ws://localhost:${PORT}`)
  console.log(`📊 情绪分析: 已启动`)
  console.log(`🔍 地址分析: 已启动`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...')
  server.close(() => {
    console.log('服务已关闭')
    process.exit(0)
  })
})