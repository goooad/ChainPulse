import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
}

interface AnalysisResult {
  address: string;
  ethTransactions: Transaction[];
  tokenTransactions: Transaction[];
  internalTransactions: Transaction[];
  summary: {
    totalEthTransactions: number;
    totalTokenTransactions: number;
    totalInternalTransactions: number;
    contractInfo?: {
      name: string;
      symbol: string;
    };
  };
  aiAnalysis: string;
}

const QUICK_ADDRS = [
  { name: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  { name: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  { name: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }
];

const AddressAnalysis: React.FC = () => {
  const [address, setAddress] = useState('0xdAC17F958D2ee523a2206206994597C13D831ec7');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'eth' | 'token' | 'internal'>('eth');
  const [displayCount, setDisplayCount] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isValidAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleAnalyze = async () => {
    if (!address.trim()) {
      setError('请输入地址');
      return;
    }

    if (!isValidAddress(address)) {
      setError('请输入有效的以太坊地址');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 开始分析地址:', address);

      const response = await fetch(`http://localhost:3001/api/address/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, limit: displayCount }),
      });

      console.log('📡 API响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API错误响应:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const response_data = await response.json();
      console.log('📊 API返回数据:', response_data);

      const data = response_data.data || response_data;
      console.log('📈 ETH交易数量:', data.ethTransactions?.length || 0);
      console.log('🪙 代币交易数量:', data.tokenTransactions?.length || 0);
      console.log('🔄 内部交易数量:', data.internalTransactions?.length || 0);
      console.log('🤖 AI分析状态:', data.aiAnalysis ? '已完成' : '未完成');

      const normalized: AnalysisResult = {
        address: data.address,
        ethTransactions: data.ethTransactions || [],
        tokenTransactions: data.tokenTransactions || [],
        internalTransactions: data.internalTransactions || [],
        summary: {
          totalEthTransactions: data.summary?.totalEthTransactions || data.ethTransactions?.length || 0,
          totalTokenTransactions: data.summary?.totalTokenTransactions || data.tokenTransactions?.length || 0,
          totalInternalTransactions: data.summary?.totalInternalTransactions || data.internalTransactions?.length || 0,
          contractInfo: data.contractInfo?.isContract ? {
            name: data.contractInfo.contractName || 'Unknown',
            symbol: (data.contractInfo.contractSymbol as string) || 'N/A'
          } : undefined
        },
        aiAnalysis: data.aiAnalysis || ''
      };

      console.log('🔄 转换后的数据结构:', normalized);
      setResult(normalized);
      setActiveTab('eth');
    } catch (err) {
      console.error('💥 分析失败:', err);
      setError(err instanceof Error ? err.message : '分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString('zh-CN');
  };

  const formatValue = (value: string, decimals: string): string => {
    const d = Math.max(0, parseInt(decimals || '18'));
    const divisor = Math.pow(10, d);
    const num = Number(value) / divisor;
    const formatted = isFinite(num) ? num.toFixed(6) : '0';
    return parseFloat(formatted).toString();
  };

  const truncateAddress = (addr: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 分页功能
  const getPaginatedData = (data: Transaction[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: Transaction[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 重置分页当切换标签时
  const handleTabChange = (tab: 'eth' | 'token' | 'internal') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900">
      {/* 顶部横幅 - 参考NFT情绪页面风格 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
            地址分析工具
          </h1>
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-lg font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 rounded-2xl shadow-lg inline-block border-2 border-gray-300">
            🔍 输入以太坊地址，快速拉取历史交易并进行分类与AI分析 📊
          </p>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* 输入区域 - 参考NFT情绪页面风格 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="text"
                placeholder="输入以太坊地址 (0x开头的40位十六进制字符)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="md:flex-1 h-14 text-base border-2 border-blue-300 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl font-medium"
                disabled={loading}
              />
              <Button
                onClick={handleAnalyze}
                disabled={loading || !address.trim()}
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    分析中...
                  </div>
                ) : (
                  '🚀 开始分析'
                )}
              </Button>
            </div>

            {/* 查询条数选择 */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">📊 查询条数:</span>
                <div className="flex items-center gap-4 text-sm">
                  {[100, 200, 500, 1000, 2000, 5000].map((count) => (
                    <button
                      key={count}
                      onClick={() => setDisplayCount(count)}
                      className={`px-2 py-1 rounded transition-colors ${
                        displayCount === count
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {count}条
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 常用地址快速选择 */}
            <div className="flex flex-wrap gap-3">
              <span className="text-sm font-medium text-gray-700 mr-2 flex items-center">🔥 常用地址:</span>
              {QUICK_ADDRS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setAddress(item.address)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    address === item.address
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:shadow-md hover:transform hover:scale-105'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* 错误提示 - 更醒目的样式 */}
            {error && (
              <div className="p-4 rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 text-base font-medium flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {error}
              </div>
            )}
          </div>
        </div>


        {/* 概览统计 - 多彩渐变卡片 */}
        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg border-2 border-blue-300 p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-3xl font-black">{result.summary?.totalEthTransactions || 0}</div>
              </div>
              <div className="text-blue-100 font-bold text-base">ETH 交易</div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl shadow-lg border-2 border-emerald-300 p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="text-3xl font-black">{result.summary?.totalTokenTransactions || 0}</div>
              </div>
              <div className="text-emerald-100 font-bold text-base">代币交易</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg border-2 border-purple-300 p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
                <div className="text-3xl font-black">{result.summary?.totalInternalTransactions || 0}</div>
              </div>
              <div className="text-purple-100 font-bold text-base">内部交易</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-lg border-2 border-orange-300 p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-3xl font-black">{result.aiAnalysis ? '✓' : '⏳'}</div>
              </div>
              <div className="text-orange-100 font-bold text-base">AI 分析</div>
            </div>
          </div>
        )}

        {/* 合约信息 */}
        {result?.summary?.contractInfo && (
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800">合约信息</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase text-slate-500">合约名称</div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {result.summary.contractInfo.name || '未知合约'}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase text-slate-500">代币符号</div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {result.summary.contractInfo.symbol && result.summary.contractInfo.symbol !== 'N/A' 
                    ? result.summary.contractInfo.symbol 
                    : '暂无符号'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 详情与标签 */}
        {result && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800">交易记录详情</CardTitle>

              {/* 标签按钮组 */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleTabChange('eth')}
                  className={`px-3.5 py-2 rounded-md text-sm border transition ${
                    activeTab === 'eth'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ETH 交易 ({result.ethTransactions?.length || 0})
                </button>
                <button
                  onClick={() => handleTabChange('token')}
                  className={`px-3.5 py-2 rounded-md text-sm border transition ${
                    activeTab === 'token'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  代币交易 ({result.tokenTransactions?.length || 0})
                </button>
                <button
                  onClick={() => handleTabChange('internal')}
                  className={`px-3.5 py-2 rounded-md text-sm border transition ${
                    activeTab === 'internal'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  内部交易 ({result.internalTransactions?.length || 0})
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* ETH */}
              {activeTab === 'eth' && (
                <div className="space-y-4">
                  {getPaginatedData(result.ethTransactions || []).map((tx, idx) => (
                    <div key={tx.hash} className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-full"></div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg text-sm font-bold">
                            #{(currentPage - 1) * itemsPerPage + idx + 1}
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-blue-700">{formatTimestamp(tx.timeStamp)}</span>
                          </div>
                        </div>
                        <a
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          查看详情
                        </a>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">发送方</div>
                          <div className="font-mono text-sm font-medium text-gray-800">{tx.from.slice(0, 8)}...{tx.from.slice(-6)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">接收方</div>
                          <div className="font-mono text-sm font-medium text-gray-800">{tx.to.slice(0, 8)}...{tx.to.slice(-6)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">金额</div>
                          <div className="font-bold text-lg text-blue-700">{formatValue(tx.value, '18')} ETH</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!result.ethTransactions || result.ethTransactions.length === 0) && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">暂无 ETH 交易记录</p>
                    </div>
                  )}
                  
                  {/* 分页控件 */}
                  {result.ethTransactions && result.ethTransactions.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-3 mt-8 p-4 bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        上一页
                      </button>
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-700">
                          第 {currentPage} 页，共 {getTotalPages(result.ethTransactions)} 页
                        </span>
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === getTotalPages(result.ethTransactions)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        下一页
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Token */}
              {activeTab === 'token' && (
                <div className="space-y-4">
                  {getPaginatedData(result.tokenTransactions || []).map((tx, idx) => (
                    <div key={tx.hash} className="group relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-emerald-300">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-bl-full"></div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 text-white rounded-lg text-sm font-bold">
                            #{(currentPage - 1) * itemsPerPage + idx + 1}
                          </div>
                          <div className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
                            {tx.tokenSymbol || 'TOKEN'}
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-emerald-700">{formatTimestamp(tx.timeStamp)}</span>
                          </div>
                        </div>
                        <a
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          查看详情
                        </a>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
                          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">发送方</div>
                          <div className="font-mono text-sm font-medium text-gray-800">{tx.from.slice(0, 8)}...{tx.from.slice(-6)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
                          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">接收方</div>
                          <div className="font-mono text-sm font-medium text-gray-800">{tx.to.slice(0, 8)}...{tx.to.slice(-6)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
                          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">金额</div>
                          <div className="font-bold text-lg text-emerald-700">
                            {formatValue(tx.value, tx.tokenDecimal || '18')} {tx.tokenSymbol}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!result.tokenTransactions || result.tokenTransactions.length === 0) && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">暂无代币交易记录</p>
                    </div>
                  )}
                  
                  {/* 分页控件 */}
                  {result.tokenTransactions && result.tokenTransactions.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-3 mt-8 p-4 bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        上一页
                      </button>
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg">
                        <span className="text-sm font-medium text-emerald-700">
                          第 {currentPage} 页，共 {getTotalPages(result.tokenTransactions)} 页
                        </span>
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === getTotalPages(result.tokenTransactions)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        下一页
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Internal */}
              {activeTab === 'internal' && (
                <div className="space-y-4">
                  {getPaginatedData(result.internalTransactions || []).map((tx, idx) => (
                    <div key={tx.hash} className="group relative overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-transparent rounded-bl-full"></div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-lg text-sm font-bold">
                            #{(currentPage - 1) * itemsPerPage + idx + 1}
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-purple-700">{formatTimestamp(tx.timeStamp)}</span>
                          </div>
                        </div>
                        <a
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          查看详情
                        </a>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
                          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">发送方</div>
                          <div className="font-mono text-sm font-medium text-gray-800">{tx.from.slice(0, 8)}...{tx.from.slice(-6)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
                          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">接收方</div>
                          <div className="font-mono text-sm font-medium text-gray-800">{tx.to.slice(0, 8)}...{tx.to.slice(-6)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
                          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">金额</div>
                          <div className="font-bold text-lg text-purple-700">{formatValue(tx.value, '18')} ETH</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!result.internalTransactions || result.internalTransactions.length === 0) && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">暂无内部交易记录</p>
                    </div>
                  )}
                  
                  {/* 分页控件 */}
                  {result.internalTransactions && result.internalTransactions.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-3 mt-8 p-4 bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        上一页
                      </button>
                      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium text-purple-700">
                          第 {currentPage} 页，共 {getTotalPages(result.internalTransactions)} 页
                        </span>
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === getTotalPages(result.internalTransactions)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        下一页
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI 智能分析 - 美化版本，放在交易记录详情下面 */}
        {result && result.aiAnalysis && (
          <div className="mt-8">
            <div className="relative overflow-hidden rounded-2xl border-2 border-gradient-to-r from-indigo-200 to-purple-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-xl">
              {/* 装饰性背景元素 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/10 to-indigo-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              {/* 头部 */}
              <div className="relative p-6 border-b border-indigo-200/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      🤖 AI 智能分析
                    </div>
                    <div className="text-sm text-indigo-600 font-medium mt-1">
                      基于 Kimi AI 的深度分析报告
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 内容区域 */}
              <div className="relative p-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">分析结果</span>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                      <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-800 font-medium">
                        {result.aiAnalysis}
                      </pre>
                    </div>
                  </div>
                  
                  {/* 底部装饰 */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      分析完成时间: {new Date().toLocaleString('zh-CN')}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressAnalysis;