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

    // 步骤5: AI分析
    console.log('🤖 [步骤6] 开始AI分析...')
    const aiPrompt = `
请分析以下以太坊地址的交易数据：

地址: ${address}
是否为合约: ${isContractAddress ? '是' : '否'}
${isContractAddress ? `合约名称: ${contractInfo.ContractName || '未知'}` : ''}
ETH余额: ${ethBalance} ETH
总交易数: ${stats.totalTransactions}
- ETH交易: ${stats.totalEthTx}
- 代币交易: ${stats.totalTokenTx}  
- 内部交易: ${stats.totalInternalTx}

最近的ETH交易:
${analysisData.recentEthTx.map((tx: any) => `- ${tx.timestamp}: ${tx.from === address ? '发送' : '接收'} ${tx.value} ETH`).join('\n')}

最近的代币交易:
${analysisData.recentTokenTx.map((tx: any) => `- ${tx.timestamp}: ${tx.tokenSymbol} ${tx.value}`).join('\n')}

请从以下角度进行分析：
1. 地址类型和用途判断
2. 交易活跃度分析
3. 资金流向特征
4. 风险评估
5. 总结和建议

请用中文回答，条理清晰。
`

    const aiAnalysis = await analyzeWithKimi(aiPrompt)

    // 计算唯一代币数量
    const uniqueTokens = new Set(tokenTransactions.map((tx: any) => tx.contractAddress)).size
    
    // 计算总ETH价值
    const totalEthValue = ethTransactions.reduce((sum: number, tx: any) => {
      return sum + parseFloat(formatWeiToEth(tx.value))
    }, 0)

    // 获取时间范围
    const allTxTimestamps = [
      ...ethTransactions.map((tx: any) => parseInt(tx.timeStamp)),
      ...tokenTransactions.map((tx: any) => parseInt(tx.timeStamp)),
      ...internalTransactions.map((tx: any) => parseInt(tx.timeStamp))
    ].filter(t => t > 0).sort((a, b) => a - b)

    const firstTxDate = allTxTimestamps.length > 0 ? allTxTimestamps[0] : 0
    const lastTxDate = allTxTimestamps.length > 0 ? allTxTimestamps[allTxTimestamps.length - 1] : 0

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
          firstTransactionDate: firstTxDate ? new Date(firstTxDate * 1000).toISOString() : '',
          lastTransactionDate: lastTxDate ? new Date(lastTxDate * 1000).toISOString() : ''
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