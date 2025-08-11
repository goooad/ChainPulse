import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'

interface EthTransaction {
  hash: string
  blockNumber: string
  timeStamp: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  gasUsed: string
  isError: string
  methodId: string
  functionName: string
}

interface TokenTransaction {
  hash: string
  blockNumber: string
  timeStamp: string
  from: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  contractAddress: string
  gas: string
  gasPrice: string
  gasUsed: string
}

interface InternalTransaction {
  hash: string
  blockNumber: string
  timeStamp: string
  from: string
  to: string
  value: string
  gas: string
  gasUsed: string
  isError: string
  type: string
}

interface ContractInfo {
  isContract: boolean
  contractName?: string
  contractCreator?: string
  contractCreationTxHash?: string
  sourceCode?: string
  abi?: string
}

interface AddressAnalysisResult {
  address: string
  isContract: boolean
  contractInfo?: ContractInfo
  ethBalance: string
  ethTransactions: EthTransaction[]
  tokenTransactions: TokenTransaction[]
  internalTransactions: InternalTransaction[]
  summary: {
    totalEthTransactions: number
    totalTokenTransactions: number
    totalInternalTransactions: number
    totalEthValue: string
    uniqueTokens: number
    firstTransactionDate: string
    lastTransactionDate: string
  }
  aiAnalysis?: string
}

export class AddressAnalysisService {
  private readonly ETHERSCAN_BASE_URL = 'https://api.etherscan.io/api'
  private readonly ETHERSCAN_API_KEY: string
  private readonly PROXY_URL?: string
  private readonly MOONSHOT_API_KEY: string
  private readonly MOONSHOT_BASE_URL = 'https://api.moonshot.cn/v1/chat/completions'
  private readonly MAX_RECORDS = 5000 // 限制最大记录数为5000

  constructor() {
    this.ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''
    this.MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY || ''
    this.PROXY_URL = process.env.HTTPS_PROXY

    if (!this.ETHERSCAN_API_KEY || this.ETHERSCAN_API_KEY === 'YourEtherscanAPIKey') {
      console.warn('⚠️ [地址分析] 警告: ETHERSCAN_API_KEY 未正确配置')
    }

    if (!this.MOONSHOT_API_KEY || this.MOONSHOT_API_KEY === 'YourMoonshotAPIKey') {
      console.warn('⚠️ [地址分析] 警告: MOONSHOT_API_KEY 未正确配置')
    }
  }

  private fetchWithProxy = (url: string, options: any = {}) => {
    if (this.PROXY_URL) {
      const agent = new HttpsProxyAgent(this.PROXY_URL)
      return fetch(url, { ...options, agent })
    }
    return fetch(url, options)
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 检查地址是否为合约
  private async checkIfContract(address: string): Promise<ContractInfo> {
    const url = `${this.ETHERSCAN_BASE_URL}?module=contract&action=getsourcecode&address=${address}&apikey=${this.ETHERSCAN_API_KEY}`
    
    try {
      console.log(`🔍 [地址分析] 检查合约信息: ${address}`)
      const response = await this.fetchWithProxy(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json() as any
      
      if (data.status === '0') {
        console.log(`⚠️ [地址分析] 获取合约信息失败: ${data.message}`)
        return { isContract: false }
      }

      const result = data.result[0]
      const isContract = result.SourceCode !== '' || result.ABI !== 'Contract source code not verified'
      
      if (isContract) {
        console.log(`📋 [地址分析] 发现合约: ${result.ContractName || '未命名合约'}`)
        return {
          isContract: true,
          contractName: result.ContractName || '未知合约',
          contractCreator: result.ContractCreator,
          contractCreationTxHash: result.TxHash,
          sourceCode: result.SourceCode ? '已验证' : '未验证',
          abi: result.ABI !== 'Contract source code not verified' ? '可用' : '不可用'
        }
      }

      return { isContract: false }
    } catch (error) {
      console.error('❌ [地址分析] 检查合约信息失败:', error)
      return { isContract: false }
    }
  }

  // 获取ETH余额
  private async getEthBalance(address: string): Promise<string> {
    const url = `${this.ETHERSCAN_BASE_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.ETHERSCAN_API_KEY}`
    
    try {
      console.log(`💰 [地址分析] 获取ETH余额: ${address}`)
      const response = await this.fetchWithProxy(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json() as any
      
      if (data.status === '0') {
        console.log(`⚠️ [地址分析] 获取余额失败: ${data.message}`)
        return '0'
      }

      const balanceWei = data.result
      const balanceEth = (parseInt(balanceWei) / Math.pow(10, 18)).toFixed(6)
      console.log(`💰 [地址分析] ETH余额: ${balanceEth} ETH`)
      return balanceEth
    } catch (error) {
      console.error('❌ [地址分析] 获取ETH余额失败:', error)
      return '0'
    }
  }

  // 获取普通ETH交易
  private async getEthTransactions(address: string, limit: number): Promise<EthTransaction[]> {
    const url = `${this.ETHERSCAN_BASE_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${Math.min(limit, this.MAX_RECORDS)}&sort=desc&apikey=${this.ETHERSCAN_API_KEY}`
    
    try {
      console.log(`📊 [地址分析] 获取ETH交易记录: ${address} (限制${Math.min(limit, this.MAX_RECORDS)}条)`)
      const response = await this.fetchWithProxy(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json() as any
      
      if (data.status === '0') {
        if (data.message === 'No transactions found') {
          console.log(`📊 [地址分析] 未找到ETH交易记录`)
          return []
        }
        throw new Error(`Etherscan API 错误: ${data.message}`)
      }

      const transactions = data.result || []
      console.log(`📊 [地址分析] 获取到 ${transactions.length} 条ETH交易记录`)
      return transactions
    } catch (error) {
      console.error('❌ [地址分析] 获取ETH交易失败:', error)
      return []
    }
  }

  // 获取代币交易
  private async getTokenTransactions(address: string, limit: number): Promise<TokenTransaction[]> {
    const url = `${this.ETHERSCAN_BASE_URL}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=${Math.min(limit, this.MAX_RECORDS)}&sort=desc&apikey=${this.ETHERSCAN_API_KEY}`
    
    try {
      console.log(`🪙 [地址分析] 获取代币交易记录: ${address} (限制${Math.min(limit, this.MAX_RECORDS)}条)`)
      await this.delay(1000) // API限流延迟
      
      const response = await this.fetchWithProxy(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json() as any
      
      if (data.status === '0') {
        if (data.message === 'No transactions found') {
          console.log(`🪙 [地址分析] 未找到代币交易记录`)
          return []
        }
        throw new Error(`Etherscan API 错误: ${data.message}`)
      }

      const transactions = data.result || []
      console.log(`🪙 [地址分析] 获取到 ${transactions.length} 条代币交易记录`)
      return transactions
    } catch (error) {
      console.error('❌ [地址分析] 获取代币交易失败:', error)
      return []
    }
  }

  // 获取内部交易
  private async getInternalTransactions(address: string, limit: number): Promise<InternalTransaction[]> {
    const url = `${this.ETHERSCAN_BASE_URL}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=${Math.min(limit, this.MAX_RECORDS)}&sort=desc&apikey=${this.ETHERSCAN_API_KEY}`
    
    try {
      console.log(`🔄 [地址分析] 获取内部交易记录: ${address} (限制${Math.min(limit, this.MAX_RECORDS)}条)`)
      await this.delay(1000) // API限流延迟
      
      const response = await this.fetchWithProxy(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json() as any
      
      if (data.status === '0') {
        if (data.message === 'No transactions found') {
          console.log(`🔄 [地址分析] 未找到内部交易记录`)
          return []
        }
        throw new Error(`Etherscan API 错误: ${data.message}`)
      }

      const transactions = data.result || []
      console.log(`🔄 [地址分析] 获取到 ${transactions.length} 条内部交易记录`)
      return transactions
    } catch (error) {
      console.error('❌ [地址分析] 获取内部交易失败:', error)
      return []
    }
  }

  // 调用Kimi AI分析
  private async getAIAnalysis(analysisData: any): Promise<string> {
    if (!this.MOONSHOT_API_KEY || this.MOONSHOT_API_KEY === 'YourMoonshotAPIKey') {
      console.warn('⚠️ [地址分析] Kimi API密钥未配置，跳过AI分析')
      return '暂无AI分析（API密钥未配置）'
    }

    try {
      console.log('🤖 [地址分析] 开始AI分析...')
      
      const prompt = `请分析以下以太坊地址的交易数据，并给出专业的分析报告：

地址信息：
- 地址: ${analysisData.address}
- 是否为合约: ${analysisData.isContract ? '是' : '否'}
${analysisData.contractInfo ? `- 合约名称: ${analysisData.contractInfo.contractName}` : ''}
- ETH余额: ${analysisData.ethBalance} ETH

交易统计：
- ETH交易数量: ${analysisData.summary.totalEthTransactions}
- 代币交易数量: ${analysisData.summary.totalTokenTransactions}
- 内部交易数量: ${analysisData.summary.totalInternalTransactions}
- 涉及代币种类: ${analysisData.summary.uniqueTokens}
- 首次交易时间: ${analysisData.summary.firstTransactionDate}
- 最近交易时间: ${analysisData.summary.lastTransactionDate}

请从以下角度进行分析：
1. 地址类型判断（个人钱包、交易所、DeFi协议、机器人等）
2. 交易行为特征分析
3. 风险评估（正常/可疑/高风险）
4. 资金流向分析
5. 活跃度评估

请用中文回答，控制在500字以内。`

      const response = await this.fetchWithProxy(this.MOONSHOT_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.MOONSHOT_API_KEY}`
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`Kimi API请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any
      const analysis = data.choices?.[0]?.message?.content || '分析失败'
      
      console.log('🤖 [地址分析] AI分析完成')
      return analysis
    } catch (error) {
      console.error('❌ [地址分析] AI分析失败:', error)
      return `AI分析失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  // 主要分析方法
  async analyzeAddress(address: string, limit: number = 500): Promise<AddressAnalysisResult> {
    console.log(`🚀 [地址分析] 开始分析地址: ${address}`)
    console.log(`📋 [地址分析] 分析参数: { limit: ${Math.min(limit, this.MAX_RECORDS)} }`)
    
    // 验证地址格式
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('无效的以太坊地址格式')
    }

    // 限制最大记录数
    const actualLimit = Math.min(limit, this.MAX_RECORDS)
    if (limit > this.MAX_RECORDS) {
      console.warn(`⚠️ [地址分析] 请求记录数 ${limit} 超过最大限制，已调整为 ${this.MAX_RECORDS}`)
    }

    try {
      // 1. 检查是否为合约地址
      const contractInfo = await this.checkIfContract(address)
      await this.delay(1000)

      // 2. 获取ETH余额
      const ethBalance = await this.getEthBalance(address)
      await this.delay(1000)

      // 3. 串行获取交易数据（避免API限流）
      const ethTransactions = await this.getEthTransactions(address, actualLimit)
      const tokenTransactions = await this.getTokenTransactions(address, actualLimit)
      const internalTransactions = await this.getInternalTransactions(address, actualLimit)

      // 4. 计算统计信息
      const allTransactions = [...ethTransactions, ...tokenTransactions, ...internalTransactions]
      const timestamps = allTransactions
        .map(tx => parseInt(tx.timeStamp))
        .filter(ts => !isNaN(ts))
        .sort((a, b) => a - b)

      const uniqueTokens = new Set(tokenTransactions.map(tx => tx.tokenSymbol)).size
      const totalEthValue = ethTransactions
        .reduce((sum, tx) => sum + parseFloat(tx.value) / Math.pow(10, 18), 0)
        .toFixed(6)

      const summary = {
        totalEthTransactions: ethTransactions.length,
        totalTokenTransactions: tokenTransactions.length,
        totalInternalTransactions: internalTransactions.length,
        totalEthValue,
        uniqueTokens,
        firstTransactionDate: timestamps.length > 0 ? new Date(timestamps[0] * 1000).toISOString() : '',
        lastTransactionDate: timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1] * 1000).toISOString() : ''
      }

      console.log(`📊 [地址分析] 数据统计完成:`, summary)

      // 5. 准备分析结果
      const analysisResult: AddressAnalysisResult = {
        address,
        isContract: contractInfo.isContract,
        contractInfo: contractInfo.isContract ? contractInfo : undefined,
        ethBalance,
        ethTransactions,
        tokenTransactions,
        internalTransactions,
        summary
      }

      // 6. 调用AI分析
      try {
        const aiAnalysis = await this.getAIAnalysis(analysisResult)
        analysisResult.aiAnalysis = aiAnalysis
      } catch (error) {
        console.error('❌ [地址分析] AI分析失败，继续返回基础数据:', error)
        analysisResult.aiAnalysis = 'AI分析暂时不可用'
      }

      console.log(`✅ [地址分析] 地址分析完成: ${address}`)
      return analysisResult

    } catch (error) {
      console.error('❌ [地址分析] 分析过程中发生错误:', error)
      throw error
    }
  }
}