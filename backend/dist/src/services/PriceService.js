"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceService = void 0;
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
class PriceService {
    constructor() {
        this.isMonitoring = false;
        this.priceAlerts = [];
    }
    startMonitoring() {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        console.log('💰 价格监控已启动');
        // 每分钟更新一次价格数据
        node_cron_1.default.schedule('* * * * *', async () => {
            try {
                await this.updatePrices();
            }
            catch (error) {
                console.error('价格更新失败:', error);
            }
        });
        // 每5分钟检查一次价格预警
        node_cron_1.default.schedule('*/5 * * * *', async () => {
            try {
                await this.checkPriceAlerts();
            }
            catch (error) {
                console.error('价格预警检查失败:', error);
            }
        });
    }
    async updatePrices() {
        try {
            // 获取主流币种价格
            const coinIds = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot', 'dogecoin', 'avalanche-2'];
            const response = await axios_1.default.get('https://api.coingecko.com/api/v3/simple/price', {
                params: {
                    ids: coinIds.join(','),
                    vs_currencies: 'usd',
                    include_24hr_change: true,
                    include_24hr_vol: true
                },
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Web3Sentry/1.0'
                }
            });
            const prices = response.data;
            console.log('💰 价格数据已更新');
            // 这里应该保存到数据库或缓存
            // await this.savePrices(prices)
        }
        catch (error) {
            console.error('获取价格数据失败:', error);
        }
    }
    async checkPriceAlerts() {
        // 检查价格预警
        for (const alert of this.priceAlerts) {
            if (!alert.isActive)
                continue;
            try {
                const currentPrice = await this.getCurrentPrice(alert.symbol);
                if ((alert.type === 'above' && currentPrice >= alert.targetPrice) ||
                    (alert.type === 'below' && currentPrice <= alert.targetPrice)) {
                    // 触发预警
                    console.log(`🚨 价格预警触发: ${alert.symbol} ${currentPrice}`);
                    // 发送通知
                    // await this.sendPriceAlert(alert, currentPrice)
                    // 禁用预警避免重复触发
                    alert.isActive = false;
                }
            }
            catch (error) {
                console.error(`检查${alert.symbol}价格预警失败:`, error);
            }
        }
    }
    async getCurrentPrice(symbol) {
        try {
            const response = await axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price`, {
                params: {
                    ids: symbol.toLowerCase(),
                    vs_currencies: 'usd'
                }
            });
            return response.data[symbol.toLowerCase()]?.usd || 0;
        }
        catch (error) {
            console.error(`获取${symbol}价格失败:`, error);
            return 0;
        }
    }
    addPriceAlert(alert) {
        this.priceAlerts.push(alert);
        console.log(`📊 添加价格预警: ${alert.symbol} ${alert.type} ${alert.targetPrice}`);
    }
    stopMonitoring() {
        this.isMonitoring = false;
        console.log('💰 价格监控已停止');
    }
}
exports.PriceService = PriceService;
//# sourceMappingURL=PriceService.js.map