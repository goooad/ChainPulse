import { WebSocketServer, WebSocket } from 'ws'

export class WebSocketService {
  private wss: WebSocketServer
  private clients: Set<WebSocket> = new Set()

  constructor(wss: WebSocketServer) {
    this.wss = wss
    this.setupWebSocket()
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 新的WebSocket连接')
      this.clients.add(ws)

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString())
          this.handleMessage(ws, data)
        } catch (error) {
          console.error('处理WebSocket消息失败:', error)
        }
      })

      ws.on('close', () => {
        console.log('🔌 WebSocket连接关闭')
        this.clients.delete(ws)
      })

      ws.on('error', (error) => {
        console.error('WebSocket错误:', error)
        this.clients.delete(ws)
      })

      // 发送欢迎消息
      this.sendToClient(ws, {
        type: 'welcome',
        message: 'Web3Sentry连接成功',
        timestamp: new Date()
      })
    })
  }

  private handleMessage(ws: WebSocket, data: any) {
    switch (data.type) {
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: new Date() })
        break
      
      case 'subscribe':
        // 处理订阅请求
        console.log('订阅:', data.channel)
        break
      
      case 'unsubscribe':
        // 处理取消订阅
        console.log('取消订阅:', data.channel)
        break
      
      default:
        console.log('未知消息类型:', data.type)
    }
  }

  sendToClient(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  broadcast(type: string, data: any) {
    const message = JSON.stringify({
      type,
      data,
      timestamp: new Date()
    })

    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })

    console.log(`📡 广播消息: ${type} 到 ${this.clients.size} 个客户端`)
  }

  getClientCount(): number {
    return this.clients.size
  }
}