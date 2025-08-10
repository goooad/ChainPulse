"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https_proxy_agent_1 = require("https-proxy-agent");
const node_fetch_1 = __importDefault(require("node-fetch"));
const router = express_1.default.Router();
// Twitter API 搜索推文 - 支持GET和POST方法
router.get('/search', async (req, res) => {
    try {
        const { q: query, count = 100, tweet_fields } = req.query;
        const max_results = parseInt(count) || 100;
        const bearerToken = process.env.TWITTER_BEARER_TOKEN;
        if (!bearerToken) {
            return res.status(503).json({
                success: false,
                error: 'Twitter Bearer Token 未配置，请联系管理员'
            });
        }
        const searchParams = new URLSearchParams({
            query: `${query} NFT -is:retweet lang:en`,
            max_results: max_results.toString(),
            'tweet.fields': tweet_fields || 'created_at,author_id,public_metrics,context_annotations'
        });
        console.log('发送Twitter API请求:', `https://api.twitter.com/2/tweets/search/recent?${searchParams}`);
        // 配置代理（如果环境变量中有设置）
        const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
        const fetchOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'User-Agent': 'Web3Sentry/1.0'
            },
            signal: AbortSignal.timeout(30000) // 增加超时时间
        };
        // 如果有代理设置，使用代理
        if (proxyUrl) {
            console.log('使用代理:', proxyUrl);
            fetchOptions.agent = new https_proxy_agent_1.HttpsProxyAgent(proxyUrl);
        }
        const response = await (0, node_fetch_1.default)(`https://api.twitter.com/2/tweets/search/recent?${searchParams}`, fetchOptions);
        console.log('Twitter API响应状态:', response.status);
        const responseData = await response.json();
        console.log('Twitter API响应数据:', JSON.stringify(responseData, null, 2));
        // 检查Twitter API特定错误
        if (responseData.title === 'UsageCapExceeded') {
            console.log('Twitter API配额已用完:', responseData);
            return res.status(429).json({
                success: false,
                error: 'Twitter API月度配额已用完，请等待下个月重置或升级套餐',
                details: {
                    message: responseData.detail,
                    period: responseData.period,
                    account_id: responseData.account_id
                }
            });
        }
        // 检查429错误（请求过于频繁）- 返回模拟数据
        if (response.status === 429) {
            console.log('Twitter API请求频率限制，返回模拟数据:', responseData);
            const mockData = {
                tweets: [
                    {
                        id: '1',
                        text: `${query} floor price is pumping! 🚀 This collection never disappoints. #NFT`,
                        author: 'nft_trader_1',
                        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                        metrics: {
                            retweet_count: 45,
                            like_count: 128,
                            reply_count: 23
                        }
                    },
                    {
                        id: '2',
                        text: `Not sure about ${query} anymore... prices are too volatile and the roadmap seems unclear 😕`,
                        author: 'crypto_skeptic',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                        metrics: {
                            retweet_count: 12,
                            like_count: 34,
                            reply_count: 67
                        }
                    },
                    {
                        id: '3',
                        text: `${query} community is still strong! Great utility and amazing art. Holding for long term 💎🙌`,
                        author: 'diamond_hands',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
                        metrics: {
                            retweet_count: 89,
                            like_count: 256,
                            reply_count: 45
                        }
                    },
                    {
                        id: '4',
                        text: `${query} partnership with major brands is bullish! This is just the beginning 🔥`,
                        author: 'nft_bull',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                        metrics: {
                            retweet_count: 156,
                            like_count: 423,
                            reply_count: 78
                        }
                    },
                    {
                        id: '5',
                        text: `${query} gas fees are killing me... maybe it's time to look at other chains 😤`,
                        author: 'gas_victim',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
                        metrics: {
                            retweet_count: 23,
                            like_count: 67,
                            reply_count: 34
                        }
                    }
                ],
                total: 1247
            };
            return res.json({
                success: true,
                data: mockData,
                isMockData: true,
                message: '由于API限制(429)，返回模拟数据'
            });
        }
        // 检查响应状态
        if (response.status !== 200) {
            console.log(`Twitter API返回非200状态码: ${response.status}`, responseData);
            return res.status(response.status).json({
                success: false,
                error: `Twitter API返回状态码: ${response.status}`,
                details: responseData
            });
        }
        // 检查是否有数据
        if (!responseData.data) {
            return res.json({
                success: true,
                data: {
                    tweets: [],
                    total: 0
                }
            });
        }
        // 转换Twitter API响应格式
        const tweets = responseData.data.map((tweet) => ({
            id: tweet.id,
            text: tweet.text,
            author: tweet.author_id,
            created_at: tweet.created_at,
            metrics: {
                retweet_count: tweet.public_metrics?.retweet_count || 0,
                like_count: tweet.public_metrics?.like_count || 0,
                reply_count: tweet.public_metrics?.reply_count || 0,
            }
        }));
        res.json({
            success: true,
            data: {
                tweets,
                total: responseData.meta?.result_count || 0
            }
        });
    }
    catch (error) {
        console.error('Twitter API 调用失败:', error.message);
        console.error('错误详情:', error);
        // 根据不同的错误类型返回不同的状态码
        if (error.name === 'AbortError') {
            // 请求超时
            return res.status(408).json({
                success: false,
                error: 'Twitter API请求超时，请稍后重试'
            });
        }
        else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            // 网络连接错误
            return res.status(503).json({
                success: false,
                error: '无法连接到Twitter API，请检查网络连接'
            });
        }
        else {
            // 其他未知错误，返回400而不是500
            return res.status(400).json({
                success: false,
                error: '请求处理失败，请检查请求参数',
                details: error.message
            });
        }
    }
});
// Twitter API 搜索推文 - POST方法
router.post('/search', async (req, res) => {
    try {
        const { query, max_results = 100, tweet_fields } = req.body;
        const bearerToken = process.env.TWITTER_API_KEY || process.env.TWITTER_BEARER_TOKEN;
        if (!bearerToken) {
            return res.status(503).json({
                success: false,
                error: 'Twitter Bearer Token 未配置，请联系管理员'
            });
        }
        const searchParams = new URLSearchParams({
            query: `${query} NFT -is:retweet lang:en`,
            max_results: max_results.toString(),
            'tweet.fields': tweet_fields || 'created_at,author_id,public_metrics,context_annotations'
        });
        console.log('发送Twitter API请求:', `https://api.twitter.com/2/tweets/search/recent?${searchParams}`);
        // 配置代理（如果环境变量中有设置）
        const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
        const fetchOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'User-Agent': 'Web3Sentry/1.0'
            },
            signal: AbortSignal.timeout(30000) // 增加超时时间
        };
        // 如果有代理设置，使用代理
        if (proxyUrl) {
            console.log('使用代理:', proxyUrl);
            fetchOptions.agent = new https_proxy_agent_1.HttpsProxyAgent(proxyUrl);
        }
        const response = await (0, node_fetch_1.default)(`https://api.twitter.com/2/tweets/search/recent?${searchParams}`, fetchOptions);
        console.log('Twitter API响应状态:', response.status);
        const responseData = await response.json();
        console.log('Twitter API响应数据:', JSON.stringify(responseData, null, 2));
        // 检查Twitter API特定错误
        if (responseData.title === 'UsageCapExceeded') {
            console.log('Twitter API配额已用完:', responseData);
            return res.status(429).json({
                success: false,
                error: 'Twitter API月度配额已用完，请等待下个月重置或升级套餐',
                details: {
                    message: responseData.detail,
                    period: responseData.period,
                    account_id: responseData.account_id
                }
            });
        }
        // 检查429错误（请求过于频繁）- 返回模拟数据
        if (response.status === 429) {
            console.log('Twitter API请求频率限制，返回模拟数据:', responseData);
            const mockData = {
                tweets: [
                    {
                        id: '1',
                        text: `${query} floor price is pumping! 🚀 This collection never disappoints. #NFT`,
                        author: 'nft_trader_1',
                        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                        metrics: {
                            retweet_count: 45,
                            like_count: 128,
                            reply_count: 23
                        }
                    },
                    {
                        id: '2',
                        text: `Not sure about ${query} anymore... prices are too volatile and the roadmap seems unclear 😕`,
                        author: 'crypto_skeptic',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                        metrics: {
                            retweet_count: 12,
                            like_count: 34,
                            reply_count: 67
                        }
                    },
                    {
                        id: '3',
                        text: `${query} community is still strong! Great utility and amazing art. Holding for long term 💎🙌`,
                        author: 'diamond_hands',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
                        metrics: {
                            retweet_count: 89,
                            like_count: 256,
                            reply_count: 45
                        }
                    },
                    {
                        id: '4',
                        text: `${query} partnership with major brands is bullish! This is just the beginning 🔥`,
                        author: 'nft_bull',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                        metrics: {
                            retweet_count: 156,
                            like_count: 423,
                            reply_count: 78
                        }
                    },
                    {
                        id: '5',
                        text: `${query} gas fees are killing me... maybe it's time to look at other chains 😤`,
                        author: 'gas_victim',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
                        metrics: {
                            retweet_count: 23,
                            like_count: 67,
                            reply_count: 34
                        }
                    }
                ],
                total: 1247
            };
            return res.json({
                success: true,
                data: mockData,
                isMockData: true,
                message: '由于API限制(429)，返回模拟数据'
            });
        }
        // 检查响应状态
        if (response.status !== 200) {
            console.log(`Twitter API返回非200状态码: ${response.status}`, responseData);
            return res.status(response.status).json({
                success: false,
                error: `Twitter API返回状态码: ${response.status}`,
                details: responseData
            });
        }
        // 检查是否有数据
        if (!responseData.data) {
            return res.json({
                success: true,
                data: {
                    tweets: [],
                    total: 0
                }
            });
        }
        // 转换Twitter API响应格式
        const tweets = responseData.data.map((tweet) => ({
            id: tweet.id,
            text: tweet.text,
            author: tweet.author_id,
            created_at: tweet.created_at,
            metrics: {
                retweet_count: tweet.public_metrics?.retweet_count || 0,
                like_count: tweet.public_metrics?.like_count || 0,
                reply_count: tweet.public_metrics?.reply_count || 0,
            }
        }));
        res.json({
            success: true,
            data: {
                tweets,
                total: responseData.meta?.result_count || 0
            }
        });
    }
    catch (error) {
        console.error('Twitter API 调用失败:', error.message);
        console.error('错误详情:', error);
        // 根据不同的错误类型返回不同的状态码
        if (error.name === 'AbortError') {
            // 请求超时
            return res.status(408).json({
                success: false,
                error: 'Twitter API请求超时，请稍后重试'
            });
        }
        else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            // 网络连接错误
            return res.status(503).json({
                success: false,
                error: '无法连接到Twitter API，请检查网络连接'
            });
        }
        else {
            // 其他未知错误，返回400而不是500
            return res.status(400).json({
                success: false,
                error: '请求处理失败，请检查请求参数',
                details: error.message
            });
        }
    }
});
exports.default = router;
//# sourceMappingURL=twitter.js.map