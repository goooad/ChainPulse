import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

// 导入路由
import firewallRoutes from './routes/firewall'
import sentimentRoutes from './routes/sentiment'
import priceRoutes from './routes/price'
import settingsRoutes from './routes/settings'
import twitterRoutes from './routes/twitter'
import kimiRoutes from './routes/kimi'

// 导入服务
import { FirewallService } from './services/FirewallService'
import { SentimentService } from './services/SentimentService'
import { PriceService } from './services/PriceService'
import { WebSocketService } from './services/WebSocketService'

dotenv.config()

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

// 中间件
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/firewall', firewallRoutes)
app.use('/api/sentiment', sentimentRoutes)
app.use('/api/price', priceRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/twitter', twitterRoutes)
app.use('/api/kimi', kimiRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// WebSocket服务
const wsService = new WebSocketService(wss)

// 启动服务
const firewallService = new FirewallService()
const sentimentService = new SentimentService()
const priceService = new PriceService()

// 启动实时监控
firewallService.startMonitoring()
//sentimentService.startMonitoring()
//priceService.startMonitoring()

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Web3Sentry后端服务启动成功`)
  console.log(`📡 HTTP服务: http://localhost:${PORT}`)
  console.log(`🔌 WebSocket服务: ws://localhost:${PORT}`)
  console.log(`🛡️  防火墙监控: 已启动`)
  console.log(`📊 情绪分析: 已启动`)
  console.log(`💰 价格监控: 已启动`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...')
  server.close(() => {
    console.log('服务已关闭')
    process.exit(0)
  })
})