"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const ws_1 = require("ws");
// 导入路由
const firewall_1 = __importDefault(require("./routes/firewall"));
const sentiment_1 = __importDefault(require("./routes/sentiment"));
const price_1 = __importDefault(require("./routes/price"));
const settings_1 = __importDefault(require("./routes/settings"));
const twitter_1 = __importDefault(require("./routes/twitter"));
const kimi_1 = __importDefault(require("./routes/kimi"));
// 导入服务
const FirewallService_1 = require("./services/FirewallService");
const SentimentService_1 = require("./services/SentimentService");
const PriceService_1 = require("./services/PriceService");
const WebSocketService_1 = require("./services/WebSocketService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
// 中间件
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 路由
app.use('/api/firewall', firewall_1.default);
app.use('/api/sentiment', sentiment_1.default);
app.use('/api/price', price_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/twitter', twitter_1.default);
app.use('/api/kimi', kimi_1.default);
// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 配置状态检查接口
app.get('/api/config/status', (req, res) => {
    const twitterConfigured = !!(process.env.TWITTER_BEARER_TOKEN || process.env.TWITTER_API_KEY);
    const kimiConfigured = !!process.env.MOONSHOT_API_KEY;
    console.log('配置状态检查:', {
        TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN ? '已设置' : '未设置',
        TWITTER_API_KEY: process.env.TWITTER_API_KEY ? '已设置' : '未设置',
        MOONSHOT_API_KEY: process.env.MOONSHOT_API_KEY ? '已设置' : '未设置',
        twitterConfigured,
        kimiConfigured
    });
    const config = {
        twitter: {
            configured: twitterConfigured,
            enabled: process.env.USE_REAL_TWITTER_API !== 'false'
        },
        kimi: {
            configured: kimiConfigured,
            enabled: process.env.USE_REAL_KIMI_API !== 'false'
        }
    };
    res.json({
        success: true,
        data: config
    });
});
// WebSocket服务
const wsService = new WebSocketService_1.WebSocketService(wss);
// 启动服务
const firewallService = new FirewallService_1.FirewallService();
const sentimentService = new SentimentService_1.SentimentService();
const priceService = new PriceService_1.PriceService();
// 启动实时监控
firewallService.startMonitoring();
//sentimentService.startMonitoring()
//priceService.startMonitoring()
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Web3Sentry后端服务启动成功`);
    console.log(`📡 HTTP服务: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket服务: ws://localhost:${PORT}`);
    console.log(`🛡️  防火墙监控: 已启动`);
    console.log(`📊 情绪分析: 已启动`);
    console.log(`💰 价格监控: 已启动`);
});
// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务...');
    server.close(() => {
        console.log('服务已关闭');
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map