import { ethers } from 'ethers'
import axios from 'axios'
import { TransactionRisk, RiskLevel } from '../types'

export class FirewallService {
  private provider: ethers.JsonRpcProvider
  private isMonitoring = false

  constructor() {
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://rpc.ankr.com/eth'
    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl)
      console.log('🔗 以太坊RPC连接已初始化:', rpcUrl)
    } catch (error) {
      console.warn('⚠️ RPC连接初始化失败，将使用模拟数据:', error)
      // 创建一个空的provider，避免后续调用出错
      this.provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth')
    }
  }

  async startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    console.log('🛡️  防火墙监控已启动 (开发模式)')

    // 开发环境下暂时禁用实时监控，避免RPC连接问题
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  开发环境下跳过实时交易监听，使用模拟数据')
      this.startMockMonitoring()
      return
    }

    try {
      // 测试RPC连接
      await this.provider.getNetwork()
      console.log('✅ RPC连接测试成功')

      // 监听待处理交易
      this.provider.on('pending', async (txHash) => {
        try {
          const tx = await this.provider.getTransaction(txHash)
          if (tx) {
            const risk = await this.analyzeTransaction(tx)
            if (risk.level !== 'LOW') {
              // 发送高风险交易警报
              this.sendRiskAlert(risk)
            }
          }
        } catch (error) {
          console.error('分析交易失败:', error)
        }
      })
    } catch (error) {
      console.warn('⚠️  实时监控启动失败，使用模拟数据:', (error as Error).message)
      this.startMockMonitoring()
    }
  }

  private startMockMonitoring() {
    // 使用定时器模拟交易监控
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% 概率生成模拟风险交易
        const mockRisk: TransactionRisk = {
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          level: Math.random() > 0.7 ? 'HIGH' : 'MEDIUM',
          score: Math.floor(Math.random() * 50) + 30,
          reasons: ['模拟风险检测', '开发环境测试数据'],
          timestamp: new Date(),
          from: '0x' + Math.random().toString(16).substr(2, 40),
          to: '0x' + Math.random().toString(16).substr(2, 40),
          value: (Math.random() * 10).toString(),
          gasPrice: '20000000000'
        }
        this.sendRiskAlert(mockRisk)
      }
    }, 30000) // 每30秒检查一次
  }

  async analyzeTransaction(tx: ethers.TransactionResponse): Promise<TransactionRisk> {
    const risk: TransactionRisk = {
      transactionHash: tx.hash,
      level: 'LOW',
      score: 0,
      reasons: [],
      timestamp: new Date(),
      from: tx.from,
      to: tx.to || '',
      value: tx.value.toString(),
      gasPrice: tx.gasPrice?.toString() || '0'
    }

    // 1. 检查合约地址风险
    if (tx.to) {
      const contractRisk = await this.checkContractRisk(tx.to)
      risk.score += contractRisk.score
      risk.reasons.push(...contractRisk.reasons)
    }

    // 2. 检查交易金额异常
    const valueRisk = this.checkValueRisk(tx.value)
    risk.score += valueRisk.score
    risk.reasons.push(...valueRisk.reasons)

    // 3. 检查Gas价格异常
    if (tx.gasPrice) {
      const gasRisk = await this.checkGasRisk(tx.gasPrice)
      risk.score += gasRisk.score
      risk.reasons.push(...gasRisk.reasons)
    }

    // 4. 检查发送方地址风险
    const fromRisk = await this.checkAddressRisk(tx.from)
    risk.score += fromRisk.score
    risk.reasons.push(...fromRisk.reasons)

    // 5. 检查交易数据风险
    if (tx.data && tx.data !== '0x') {
      const dataRisk = await this.checkDataRisk(tx.data)
      risk.score += dataRisk.score
      risk.reasons.push(...dataRisk.reasons)
    }

    // 计算最终风险等级
    risk.level = this.calculateRiskLevel(risk.score)

    return risk
  }

  private async checkContractRisk(address: string): Promise<{ score: number; reasons: string[] }> {
    const reasons: string[] = []
    let score = 0

    try {
      // 检查是否为已知恶意合约
      const maliciousContracts = await this.getMaliciousContracts()
      if (maliciousContracts.includes(address.toLowerCase())) {
        score += 80
        reasons.push('合约地址在恶意合约黑名单中')
      }

      // 检查合约是否已验证
      const isVerified = await this.checkContractVerification(address)
      if (!isVerified) {
        score += 20
        reasons.push('合约源码未验证')
      }

      // 检查合约创建时间
      const contractAge = await this.getContractAge(address)
      if (contractAge < 7) { // 7天内创建的新合约
        score += 15
        reasons.push('合约创建时间过短，存在风险')
      }

    } catch (error) {
      console.error('检查合约风险失败:', error)
    }

    return { score, reasons }
  }

  private checkValueRisk(value: bigint): { score: number; reasons: string[] } {
    const reasons: string[] = []
    let score = 0

    const ethValue = Number(ethers.formatEther(value))

    // 检查异常大额交易
    if (ethValue > 100) {
      score += 30
      reasons.push(`交易金额异常大: ${ethValue.toFixed(4)} ETH`)
    } else if (ethValue > 10) {
      score += 15
      reasons.push(`交易金额较大: ${ethValue.toFixed(4)} ETH`)
    }

    return { score, reasons }
  }

  private async checkGasRisk(gasPrice: bigint): Promise<{ score: number; reasons: string[] }> {
    const reasons: string[] = []
    let score = 0

    try {
      // 获取当前网络平均Gas价格
      const feeData = await this.provider.getFeeData()
      const avgGasPrice = feeData.gasPrice || BigInt(0)

      if (gasPrice > avgGasPrice * BigInt(3)) {
        score += 25
        reasons.push('Gas价格异常高，可能为抢跑交易')
      }

    } catch (error) {
      console.error('检查Gas风险失败:', error)
    }

    return { score, reasons }
  }

  private async checkAddressRisk(address: string): Promise<{ score: number; reasons: string[] }> {
    const reasons: string[] = []
    let score = 0

    try {
      // 检查地址是否在黑名单中
      const blacklistedAddresses = await this.getBlacklistedAddresses()
      if (blacklistedAddresses.includes(address.toLowerCase())) {
        score += 70
        reasons.push('发送方地址在黑名单中')
      }

      // 检查地址交易历史
      const txCount = await this.provider.getTransactionCount(address)
      if (txCount < 5) {
        score += 10
        reasons.push('发送方地址交易历史较少')
      }

    } catch (error) {
      console.error('检查地址风险失败:', error)
    }

    return { score, reasons }
  }

  private async checkDataRisk(data: string): Promise<{ score: number; reasons: string[] }> {
    const reasons: string[] = []
    let score = 0

    try {
      // 检查函数选择器
      const functionSelector = data.slice(0, 10)
      const riskySelectors = [
        '0xa9059cbb', // transfer
        '0x095ea7b3', // approve
        '0x23b872dd', // transferFrom
      ]

      if (riskySelectors.includes(functionSelector)) {
        score += 10
        reasons.push('调用了敏感函数')
      }

      // 检查数据长度异常
      if (data.length > 10000) {
        score += 15
        reasons.push('交易数据异常长')
      }

    } catch (error) {
      console.error('检查数据风险失败:', error)
    }

    return { score, reasons }
  }

  private calculateRiskLevel(score: number): RiskLevel['level'] {
    if (score >= 70) return 'CRITICAL'
    if (score >= 50) return 'HIGH'
    if (score >= 30) return 'MEDIUM'
    return 'LOW'
  }

  private async getMaliciousContracts(): Promise<string[]> {
    // 这里应该从数据库或外部API获取恶意合约列表
    return [
      '0x1234567890123456789012345678901234567890',
      // 更多恶意合约地址...
    ]
  }

  private async getBlacklistedAddresses(): Promise<string[]> {
    // 这里应该从数据库或外部API获取黑名单地址
    return [
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      // 更多黑名单地址...
    ]
  }

  private async checkContractVerification(address: string): Promise<boolean> {
    try {
      // 使用Etherscan API检查合约验证状态
      const response = await axios.get(`https://api.etherscan.io/api`, {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: address,
          apikey: process.env.ETHERSCAN_API_KEY
        }
      })

      return response.data.result[0].SourceCode !== ''
    } catch (error) {
      console.error('检查合约验证状态失败:', error)
      return false
    }
  }

  private async getContractAge(address: string): Promise<number> {
    try {
      // 获取合约创建交易
      const code = await this.provider.getCode(address)
      if (code === '0x') return 0 // 不是合约

      // 这里简化处理，实际应该查询合约创建时间
      return 30 // 假设合约已存在30天
    } catch (error) {
      console.error('获取合约年龄失败:', error)
      return 0
    }
  }

  private sendRiskAlert(risk: TransactionRisk) {
    // 发送风险警报到WebSocket客户端
    console.log(`🚨 检测到${risk.level}风险交易:`, risk.transactionHash)
    
    // 这里应该通过WebSocket发送给前端
    // wsService.broadcast('risk-alert', risk)
  }

  stopMonitoring() {
    this.isMonitoring = false
    this.provider.removeAllListeners('pending')
    console.log('🛡️  防火墙监控已停止')
  }
}