// 生成模拟推文数据的函数
export function generateMockTweets(query: string, maxResults: number) {
  const mockUsers = [
    { id: 'user123', username: 'CryptoTrader', name: 'Crypto Trader Pro' },
    { id: 'analyst456', username: 'BlockchainAnalyst', name: 'Blockchain Analyst' },
    { id: 'trader789', username: 'DeFiTrader', name: 'DeFi Trader' },
    { id: 'expert101', username: 'Web3Expert', name: 'Web3 Expert' },
    { id: 'investor202', username: 'CryptoInvestor', name: 'Crypto Investor' },
    { id: 'dev303', username: 'EthDeveloper', name: 'Ethereum Developer' },
    { id: 'whale404', username: 'CryptoWhale', name: 'Crypto Whale' },
    { id: 'news505', username: 'CryptoNews', name: 'Crypto News Daily' },
    { id: 'guru606', username: 'NFTGuru', name: 'NFT Guru' },
    { id: 'alpha707', username: 'AlphaSeeker', name: 'Alpha Seeker' }
  ]

  const mockTweets = [
    {
      id: '1745829374658392064',
      text: `${query} 相关的最新动态！🚀 价格突破关键阻力位，技术面看涨 #crypto #blockchain #bullish`,
      author_id: 'user123',
      username: 'CryptoTrader',
      name: 'Crypto Trader Pro',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 245,
        like_count: 1250,
        reply_count: 89,
        quote_count: 67
      },
      url: 'https://twitter.com/CryptoTrader/status/1745829374658392064'
    },
    {
      id: '1745825647382947328',
      text: `关于 ${query} 的深度分析报告已发布 📊 链上数据显示大户持续增持，市场情绪转向乐观`,
      author_id: 'analyst456',
      username: 'BlockchainAnalyst',
      name: 'Blockchain Analyst',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      public_metrics: {
        retweet_count: 189,
        like_count: 890,
        reply_count: 156,
        quote_count: 45
      },
      url: 'https://twitter.com/BlockchainAnalyst/status/1745825647382947328'
    },
    {
      id: '1745821920507473920',
      text: `${query} 市场表现强劲！💪 24小时涨幅超过15%，交易量激增300%，FOMO情绪开始显现`,
      author_id: 'trader789',
      username: 'DeFiTrader',
      name: 'DeFi Trader',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      public_metrics: {
        retweet_count: 312,
        like_count: 1580,
        reply_count: 203,
        quote_count: 78
      },
      url: 'https://twitter.com/DeFiTrader/status/1745821920507473920'
    },
    {
      id: '1745818193632000000',
      text: `刚刚分析了 ${query} 的技术指标，RSI已经进入超买区域，建议谨慎追高 ⚠️ #TechnicalAnalysis`,
      author_id: 'expert101',
      username: 'Web3Expert',
      name: 'Web3 Expert',
      created_at: new Date(Date.now() - 10800000).toISOString(),
      public_metrics: {
        retweet_count: 156,
        like_count: 720,
        reply_count: 134,
        quote_count: 32
      },
      url: 'https://twitter.com/Web3Expert/status/1745818193632000000'
    },
    {
      id: '1745814466756526080',
      text: `${query} 生态系统持续扩张 🌟 新增3个重要合作伙伴，TVL突破10亿美元大关！`,
      author_id: 'investor202',
      username: 'CryptoInvestor',
      name: 'Crypto Investor',
      created_at: new Date(Date.now() - 14400000).toISOString(),
      public_metrics: {
        retweet_count: 278,
        like_count: 1340,
        reply_count: 167,
        quote_count: 89
      },
      url: 'https://twitter.com/CryptoInvestor/status/1745814466756526080'
    },
    {
      id: '1745810739881052160',
      text: `开发者更新：${query} 主网升级已完成 ✅ Gas费用降低60%，TPS提升至5000，用户体验大幅改善`,
      author_id: 'dev303',
      username: 'EthDeveloper',
      name: 'Ethereum Developer',
      created_at: new Date(Date.now() - 18000000).toISOString(),
      public_metrics: {
        retweet_count: 445,
        like_count: 2100,
        reply_count: 289,
        quote_count: 123
      },
      url: 'https://twitter.com/EthDeveloper/status/1745810739881052160'
    },
    {
      id: '1745807013005578240',
      text: `🐋 大户动态：某巨鲸地址刚刚买入价值500万美元的 ${query}，持仓总价值已超过2亿美元`,
      author_id: 'whale404',
      username: 'CryptoWhale',
      name: 'Crypto Whale',
      created_at: new Date(Date.now() - 21600000).toISOString(),
      public_metrics: {
        retweet_count: 567,
        like_count: 2890,
        reply_count: 345,
        quote_count: 178
      },
      url: 'https://twitter.com/CryptoWhale/status/1745807013005578240'
    },
    {
      id: '1745803286130104320',
      text: `📰 重磅消息：${query} 获得知名投资机构A16z领投的5000万美元B轮融资，估值达到10亿美元`,
      author_id: 'news505',
      username: 'CryptoNews',
      name: 'Crypto News Daily',
      created_at: new Date(Date.now() - 25200000).toISOString(),
      public_metrics: {
        retweet_count: 789,
        like_count: 3450,
        reply_count: 456,
        quote_count: 234
      },
      url: 'https://twitter.com/CryptoNews/status/1745803286130104320'
    },
    {
      id: '1745799559254630400',
      text: `${query} NFT系列地板价突破5 ETH！🎨 交易量24小时内增长800%，社区热度空前高涨`,
      author_id: 'guru606',
      username: 'NFTGuru',
      name: 'NFT Guru',
      created_at: new Date(Date.now() - 28800000).toISOString(),
      public_metrics: {
        retweet_count: 234,
        like_count: 1670,
        reply_count: 198,
        quote_count: 67
      },
      url: 'https://twitter.com/NFTGuru/status/1745799559254630400'
    },
    {
      id: '1745795832379156480',
      text: `Alpha信息 🔥 ${query} 即将公布重大合作消息，内部消息显示可能与某顶级交易所达成战略合作`,
      author_id: 'alpha707',
      username: 'AlphaSeeker',
      name: 'Alpha Seeker',
      created_at: new Date(Date.now() - 32400000).toISOString(),
      public_metrics: {
        retweet_count: 445,
        like_count: 2340,
        reply_count: 267,
        quote_count: 134
      },
      url: 'https://twitter.com/AlphaSeeker/status/1745795832379156480'
    }
  ]

  // 按互动数排序（点赞+转发+回复+引用）
  const sortedTweets = mockTweets.sort((a, b) => {
    const aEngagement = a.public_metrics.like_count + a.public_metrics.retweet_count + 
                       a.public_metrics.reply_count + a.public_metrics.quote_count
    const bEngagement = b.public_metrics.like_count + b.public_metrics.retweet_count + 
                       b.public_metrics.reply_count + b.public_metrics.quote_count
    return bEngagement - aEngagement
  })

  return {
    tweets: sortedTweets.slice(0, Math.min(maxResults, sortedTweets.length)),
    total: Math.min(maxResults, sortedTweets.length)
  }
}
