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
        // 检查429错误（请求过于频繁）
        if (response.status === 429) {
            console.log('Twitter API请求频率限制:', responseData);
            return res.status(429).json({
                success: false,
                error: 'Twitter API请求过于频繁，请稍后重试',
                details: responseData
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
        // 检查429错误（请求过于频繁）
        if (response.status === 429) {
            console.log('Twitter API请求频率限制:', responseData);
            return res.status(429).json({
                success: false,
                error: 'Twitter API请求过于频繁，请稍后重试',
                details: responseData
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