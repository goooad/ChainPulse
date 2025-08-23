import express from 'express'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'
const router = express.Router()

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '地址分析服务运行正常',
    timestamp: new Date().toISOString()
  })
})

// Etherscan API 请求函数
async function fetchEtherscanData(module: string, action: string, params: any): Promise<any> {
  const apiKey = process.env.ETHERSCAN_API_KEY
  if (!apiKey) {
    throw new Error('Etherscan API密钥未配置')
  }

  const baseUrl = 'https://api.etherscan.io/api'
  const searchParams = new URLSearchParams({
    module,
    action,
    apikey: apiKey,
    ...params
  })

  const url = `${baseUrl}?${searchParams}`
  console.log(`🔍 [Etherscan] 请求: ${module}/${action}`)

  // 配置代理（如果环境变量中有设置）
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  const fetchOptions: any = {
    method: 'GET',
    headers: {
      'User-Agent': 'Web3Sentry/1.0'
    },
    signal: AbortSignal.timeout(30000)
  }

  // 如果有代理设置，使用代理
  if (proxyUrl) {
    console.log('🌐 [代理] 使用代理:', proxyUrl)
    fetchOptions.agent = new HttpsProxyAgent(proxyUrl)
  }

  try {
    const response = await fetch(url, fetchOptions)
    const data: any = await response.json()
    
    if (response.ok) {
      console.log(`✅ [Etherscan] 请求成功，状态: ${data.status} 消息: ${data.message}`)
      return data
    } else {
      console.error(`❌ [Etherscan] 请求失败，状态码: ${response.status}`)
      console.error('响应数据:', data)
      throw new Error(`Etherscan API 请求失败: ${response.status}`)
    }
  } catch (error: any) {
    console.error(`❌ [Etherscan] 网络错误:`, error.message)
    throw error
  }
}

// Kimi AI 分析函数
async function analyzeWithKimi(prompt: string): Promise<string> {
  const apiKey = process.env.MOONSHOT_API_KEY
  if (!apiKey) {
    throw new Error('Kimi API密钥未配置')
  }

  const url = 'https://api.moonshot.cn/v1/chat/completions'
  
  // 配置代理（如果环境变量中有设置）
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  const fetchOptions: any = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的区块链数据分析师，擅长分析以太坊地址的交易行为和模式。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
    signal: AbortSignal.timeout(30000)
  }

  // 如果有代理设置，使用代理
  if (proxyUrl) {
    console.log('🌐 [代理] Kimi API 使用代理:', proxyUrl)
    fetchOptions.agent = new HttpsProxyAgent(proxyUrl)
  }

  try {
    console.log('🤖 [Kimi] 开始AI分析...')
    const response = await fetch(url, fetchOptions)
    const data: any = await response.json()
    const analysis = data.choices?.[0]?.message?.content || '分析失败'
    
    console.log('✅ [Kimi] AI分析完成')
    return analysis
  } catch (error: any) {
    console.error('❌ [Kimi] AI分析失败:', error.message)
    return 'AI分析服务暂时不可用，请稍后重试。'
  }
}

// 工具函数：Wei转ETH
function formatWeiToEth(wei: string): string {
  const ethValue = parseFloat(wei) / Math.pow(10, 18)
  return ethValue.toFixed(6)
}

// 工具函数：格式化时间戳
function formatTimestamp(timestamp: string): string {
  return new Date(parseInt(timestamp) * 1000).toLocaleString('zh-CN')
}

// 工具函数：检查是否为合约地址
function isContract(contractInfo: any): boolean {
  return contractInfo && contractInfo.SourceCode && contractInfo.SourceCode.length > 0
}

// 工具函数：获取合约代币信息
async function getContractTokenInfo(address: string): Promise<{symbol?: string, name?: string}> {
  try {
    // 查询该合约地址的代币交易记录（作为合约地址）
    const contractTokenTxData: any = await fetchEtherscanData('account', 'tokentx', { 
      contractaddress: address,  // 注意这里用contractaddress而不是address
      page: 1, 
      offset: 1, 
      sort: 'desc' 
    })
    
    if (contractTokenTxData?.result && contractTokenTxData.result.length > 0) {
      const tokenInfo = contractTokenTxData.result[0]
      return {
        symbol: tokenInfo.tokenSymbol,
        name: tokenInfo.tokenName
      }
    }
    
    return {}
  } catch (error) {
    console.error('❌ [获取合约代币信息失败]:', error)
    return {}
  }
}

// 地址分析API
router.post('/analyze', async (req, res) => {
  try {
    const { address, limit = 50 } = req.body
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的以太坊地址'
      })
    }

    console.log('🚀 [开始] 地址分析:', address)
    console.log('📊 [参数] 数据限制:', limit)

    // 限制最大记录数为5000
    const maxLimit = Math.min(parseInt(limit), 5000)
    
    // 步骤1: 获取地址基本信息
    console.log('📍 [步骤1] 获取地址余额...')
    const balanceData: any = await fetchEtherscanData('account', 'balance', { address, tag: 'latest' })
    
    console.log('📍 [步骤2] 检查合约信息...')
    const contractData: any = await fetchEtherscanData('contract', 'getsourcecode', { address })
    
    // 步骤2: 获取交易数据（从最新开始）
    console.log('📍 [步骤3] 获取ETH交易数据...')
    const ethTxData: any = await fetchEtherscanData('account', 'txlist', { 
      address, 
      startblock: 0, 
      endblock: 99999999, 
      page: 1, 
      offset: maxLimit, 
      sort: 'desc' 
    })
    console.log('✅ [步骤3] ETH交易数据长度:', ethTxData?.result?.length || 0)
    
    console.log('📍 [步骤4] 获取代币交易数据...')
    const tokenTxData: any = await fetchEtherscanData('account', 'tokentx', { 
      address, 
      startblock: 0, 
      endblock: 99999999, 
      page: 1, 
      offset: maxLimit, 
      sort: 'desc' 
    })
    console.log('✅ [步骤4] 代币交易数据长度:', tokenTxData?.result?.length || 0)
    
    console.log('📍 [步骤5] 获取内部交易数据...')
    const internalTxData: any = await fetchEtherscanData('account', 'txlistinternal', { 
      address, 
      startblock: 0, 
      endblock: 99999999, 
      page: 1, 
      offset: maxLimit, 
      sort: 'desc' 
    })
    console.log('✅ [步骤5] 内部交易数据长度:', internalTxData?.result?.length || 0)

    // 步骤3: 处理和格式化数据
    const ethBalance = formatWeiToEth(balanceData?.result || '0')
    const contractInfo = contractData?.result?.[0] || {}
    const isContractAddress = isContract(contractInfo)
    
    const ethTransactions = ethTxData?.result || []
    const tokenTransactions = tokenTxData?.result || []
    const internalTransactions = internalTxData?.result || []

    // 统计数据
    const stats = {
      ethBalance,
      isContract: isContractAddress,
      contractName: contractInfo.ContractName || '',
      totalEthTx: ethTransactions.length,
      totalTokenTx: tokenTransactions.length,
      totalInternalTx: internalTransactions.length,
      totalTransactions: ethTransactions.length + tokenTransactions.length + internalTransactions.length
    }

    console.log('📊 [统计] 地址统计:', stats)

    // 步骤4: 准备AI分析数据
    const analysisData = {
      address,
      stats,
      recentEthTx: ethTransactions.slice(0, 10).map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: formatWeiToEth(tx.value),
        timestamp: formatTimestamp(tx.timeStamp),
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice
      })),
      recentTokenTx: tokenTransactions.slice(0, 10).map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        tokenName: tx.tokenName,
        tokenSymbol: tx.tokenSymbol,
        timestamp: formatTimestamp(tx.timeStamp)
      })),
      recentInternalTx: internalTransactions.slice(0, 5).map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: formatWeiToEth(tx.value),
        timestamp: formatTimestamp(tx.timeStamp)
      }))
    }

    // 步骤5: 深度数据分析和AI分析
    console.log('🤖 [步骤6] 准备深度分析数据...')
    
    // 计算详细的统计数据
    const ethTotalVolume = ethTransactions.reduce((sum: number, tx: any) => sum + parseFloat(formatWeiToEth(tx.value)), 0)
    const ethSentTxs = ethTransactions.filter((tx: any) => tx.from.toLowerCase() === address.toLowerCase())
    const ethReceivedTxs = ethTransactions.filter((tx: any) => tx.to.toLowerCase() === address.toLowerCase())
    const ethFailedTxs = ethTransactions.filter((tx: any) => tx.isError === '1')
    
    // 代币统计
    const uniqueTokens = [...new Set(tokenTransactions.map((tx: any) => tx.contractAddress))]
    const tokenStats = tokenTransactions.reduce((acc: any, tx: any) => {
      const symbol = tx.tokenSymbol
      if (!acc[symbol]) {
        acc[symbol] = { count: 0, sent: 0, received: 0, name: tx.tokenName }
      }
      acc[symbol].count++
      if (tx.from.toLowerCase() === address.toLowerCase()) acc[symbol].sent++
      if (tx.to.toLowerCase() === address.toLowerCase()) acc[symbol].received++
      return acc
    }, {})
    
    // 时间分析
    const allTimestamps = [
      ...ethTransactions.map((tx: any) => parseInt(tx.timeStamp)),
      ...tokenTransactions.map((tx: any) => parseInt(tx.timeStamp)),
      ...internalTransactions.map((tx: any) => parseInt(tx.timeStamp))
    ].filter(t => t > 0).sort((a, b) => a - b)
    
    const firstTxTime = allTimestamps.length > 0 ? allTimestamps[0] : 0
    const lastTxTime = allTimestamps.length > 0 ? allTimestamps[allTimestamps.length - 1] : 0
    const accountAge = firstTxTime > 0 ? Math.floor((Date.now() / 1000 - firstTxTime) / (24 * 3600)) : 0
    
    // Gas费用分析
    const totalGasUsed = ethTransactions.reduce((sum: number, tx: any) => sum + parseInt(tx.gasUsed || '0'), 0)
    const avgGasPrice = ethTransactions.length > 0 ? 
      ethTransactions.reduce((sum: number, tx: any) => sum + parseInt(tx.gasPrice || '0'), 0) / ethTransactions.length / 1e9 : 0
    
    // 交易对手分析
    const counterparties = new Set([
      ...ethTransactions.map((tx: any) => tx.from.toLowerCase() === address.toLowerCase() ? tx.to : tx.from),
      ...tokenTransactions.map((tx: any) => tx.from.toLowerCase() === address.toLowerCase() ? tx.to : tx.from)
    ])
    
    const aiPrompt = `
请分析以下以太坊地址的交易数据（注意：这是抽样数据分析）：

## 重要说明
⚠️ 本次分析基于最近 ${maxLimit} 条交易记录的抽样数据，不是该地址的全部历史交易。
请基于抽样数据进行合理分析，避免对整体交易活跃度做绝对性判断。

## 基础信息
- 地址: ${address}
- 地址类型: ${isContractAddress ? '智能合约' : 'EOA外部账户'}
${isContractAddress ? `- 合约名称: ${contractInfo.ContractName || '未知合约'}` : ''}
- 当前ETH余额: ${ethBalance} ETH
- 账户年龄: ${accountAge} 天 (首次交易: ${firstTxTime > 0 ? new Date(firstTxTime * 1000).toLocaleDateString('zh-CN') : '未知'})

## 抽样交易数量统计（最近 ${maxLimit} 条记录）
- 抽样总交易数: ${stats.totalTransactions}
- ETH交易样本: ${stats.totalEthTx} (发送: ${ethSentTxs.length}, 接收: ${ethReceivedTxs.length}, 失败: ${ethFailedTxs.length})
- 代币交易样本: ${stats.totalTokenTx}
- 内部交易样本: ${stats.totalInternalTx}

## ETH交易样本分析
- 样本ETH交易量: ${ethTotalVolume.toFixed(4)} ETH
- 样本平均每笔交易: ${ethTransactions.length > 0 ? (ethTotalVolume / ethTransactions.length).toFixed(6) : 0} ETH
- 样本最大单笔交易: ${ethTransactions.length > 0 ? Math.max(...ethTransactions.map((tx: any) => parseFloat(formatWeiToEth(tx.value)))).toFixed(6) : 0} ETH
- 样本总Gas消耗: ${(totalGasUsed / 1e6).toFixed(2)} M Gas
- 样本平均Gas价格: ${avgGasPrice.toFixed(2)} Gwei
- 样本失败交易率: ${ethTransactions.length > 0 ? (ethFailedTxs.length / ethTransactions.length * 100).toFixed(2) : 0}%

## 代币交易样本分析
- 样本涉及代币种类: ${uniqueTokens.length} 种
- 样本主要代币活动: ${Object.entries(tokenStats).sort(([,a]: any, [,b]: any) => b.count - a.count).slice(0, 5).map(([symbol, data]: any) => 
  `${symbol}(${data.count}次, 发送${data.sent}, 接收${data.received})`).join(', ')}

## 基于样本的交易行为模式
- 样本交易对手数量: ${counterparties.size} 个不同地址
- 最近活跃度: ${allTimestamps.length > 0 && lastTxTime > 0 ? Math.floor((Date.now() / 1000 - lastTxTime) / (24 * 3600)) : 0} 天前最后交易
- 注意：由于是抽样数据，请避免计算日均交易频率等可能误导的统计指标

## 最近交易样本 (展示交易模式)
### ETH交易样本:
${ethTransactions.slice(0, 5).map((tx: any, i: number) => 
  `${i+1}. ${formatTimestamp(tx.timeStamp)} | ${tx.from.toLowerCase() === address.toLowerCase() ? '发送' : '接收'} ${formatWeiToEth(tx.value)} ETH | Gas: ${(parseInt(tx.gasUsed || '0') / 1000).toFixed(1)}K | ${tx.isError === '1' ? '失败' : '成功'}`
).join('\n')}

### 代币交易样本:
${tokenTransactions.slice(0, 5).map((tx: any, i: number) => 
  `${i+1}. ${formatTimestamp(tx.timeStamp)} | ${tx.from.toLowerCase() === address.toLowerCase() ? '发送' : '接收'} ${tx.value} ${tx.tokenSymbol} | 合约: ${tx.contractAddress.slice(0,8)}...`
).join('\n')}

### 内部交易样本:
${internalTransactions.slice(0, 3).map((tx: any, i: number) => 
  `${i+1}. ${formatTimestamp(tx.timeStamp)} | ${tx.from.toLowerCase() === address.toLowerCase() ? '发送' : '接收'} ${formatWeiToEth(tx.value)} ETH | 类型: ${tx.type || 'call'}`
).join('\n')}

请基于以上抽样数据进行合理分析，包括：
1. 地址性质和用途判断 (个人钱包/交易所/DeFi协议/机器人等)
2. 基于样本的交易行为模式分析 (请明确说明这是基于抽样数据的分析结果)
3. 资金流向和风险特征评估 (基于可观察的样本模式)
4. 基于样本数据的使用建议

⚠️ 分析要求：
- 请在涉及交易频率、活跃度等统计时，明确说明这是基于 ${maxLimit} 条抽样记录的分析
- 避免对该地址的整体历史交易活跃度做绝对性判断
- 重点分析样本中观察到的交易模式和特征
- 如需提及交易频率，请说明是"样本显示"或"近期样本中"等限定性表述

请提供专业、详细的中文分析报告。
`

    const aiAnalysis = await analyzeWithKimi(aiPrompt)
    
    // 计算总ETH价值
    const totalEthValue = ethTransactions.reduce((sum: number, tx: any) => {
      return sum + parseFloat(formatWeiToEth(tx.value))
    }, 0)

    // 步骤6: 返回结果
    const result = {
      success: true,
      data: {
        address,
        isContract: isContractAddress,
        contractInfo: isContractAddress ? {
          isContract: true,
          contractName: contractInfo.ContractName || 'Unknown Contract',
          contractSymbol: tokenTransactions.length > 0 ? tokenTransactions[0].tokenSymbol : undefined,
          contractCreator: contractInfo.ContractCreator || '',
          contractCreationTxHash: contractInfo.TxHash || '',
          sourceCode: contractInfo.SourceCode ? 'Verified' : 'Not Verified',
          abi: contractInfo.ABI || ''
        } : { isContract: false },
        ethBalance,
        ethTransactions: ethTransactions.map((tx: any) => ({
          hash: tx.hash,
          blockNumber: tx.blockNumber,
          timeStamp: tx.timeStamp,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gas: tx.gas,
          gasPrice: tx.gasPrice,
          gasUsed: tx.gasUsed,
          isError: tx.isError,
          methodId: tx.methodId || '',
          functionName: tx.functionName || ''
        })),
        tokenTransactions: tokenTransactions.map((tx: any) => ({
          hash: tx.hash,
          blockNumber: tx.blockNumber,
          timeStamp: tx.timeStamp,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          tokenName: tx.tokenName,
          tokenSymbol: tx.tokenSymbol,
          tokenDecimal: tx.tokenDecimal,
          contractAddress: tx.contractAddress,
          gas: tx.gas,
          gasPrice: tx.gasPrice,
          gasUsed: tx.gasUsed
        })),
        internalTransactions: internalTransactions.map((tx: any) => ({
          hash: tx.hash,
          blockNumber: tx.blockNumber,
          timeStamp: tx.timeStamp,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gas: tx.gas || '',
          gasUsed: tx.gasUsed || '',
          isError: tx.isError,
          type: tx.type || 'call'
        })),
        summary: {
          totalEthTransactions: ethTransactions.length,
          totalTokenTransactions: tokenTransactions.length,
          totalInternalTransactions: internalTransactions.length,
          totalEthValue: totalEthValue.toString(),
          uniqueTokens: uniqueTokens,
          firstTransactionDate: firstTxTime ? new Date(firstTxTime * 1000).toISOString() : '',
          lastTransactionDate: lastTxTime ? new Date(lastTxTime * 1000).toISOString() : ''
        },
        aiAnalysis
      },
      timestamp: new Date().toISOString()
    }

    console.log('✅ [完成] 地址分析成功')
    res.json(result)

  } catch (error: any) {
    console.error('❌ [错误] 地址分析失败:', error.message)
    console.error('错误详情:', error)
    
    // 根据不同的错误类型返回不同的状态码
    if (error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        error: 'API请求超时，请稍后重试'
      })
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return res.status(503).json({
        success: false,
        error: '无法连接到外部API，请检查网络连接'
      })
    } else {
      return res.status(400).json({
        success: false,
        error: '请求处理失败，请检查请求参数',
        details: error.message
      })
    }
  }
})

export default router