'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, TrendingUp, TrendingDown, Minus, Clock, BarChart3, Activity, RefreshCw, Zap } from 'lucide-react'

interface MinuteData {
  时间: string
  股票代码: string
  价格: number
  涨跌幅: number
  涨跌额: number
  成交量: number
  成交额: number
}

interface ApiResponse {
  code: string
  message: string
  data: {
    stock_code: string
    total_records: number
    minute_data: MinuteData[]
  }
}

export default function RealtimePage() {
  const [stockCode, setStockCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [minuteData, setMinuteData] = useState<MinuteData[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [refreshCount, setRefreshCount] = useState(0)

  // 自动刷新逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh && stockCode.trim()) {
      interval = setInterval(() => {
        handleQuery()
        setRefreshCount(prev => prev + 1)
      }, 60000) // 每分钟刷新一次
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, stockCode])

  const handleQuery = async () => {
    if (!stockCode.trim()) {
      setError('请输入股票代码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`http://localhost:8000/stock/realtime/${stockCode.trim()}`)
      const data: ApiResponse = await response.json()

      if (data.code === '200') {
        setMinuteData(data.data.minute_data)
        setTotalRecords(data.data.total_records)
        setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
      } else {
        setError(data.message || '查询失败')
      }
    } catch (err) {
      setError('网络错误，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万'
    }
    return num.toLocaleString()
  }

  const getPriceColor = (change: number) => {
    if (change > 0) return 'text-red-400'
    if (change < 0) return 'text-green-400'
    return 'text-gray-400'
  }

  const getPriceIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-red-400" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-green-400" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const formatTime = (timeStr: string) => {
    return timeStr
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
    if (!autoRefresh) {
      setRefreshCount(0)
    }
  }

  const calculateStats = () => {
    if (minuteData.length === 0) return null
    
    const latestPrice = minuteData[0]?.价格 || 0
    const latestChange = minuteData[0]?.涨跌幅 || 0
    const avgPrice = minuteData.reduce((sum, item) => sum + item.价格, 0) / minuteData.length
    const totalVolume = minuteData.reduce((sum, item) => sum + item.成交量, 0)
    const priceTrend = minuteData.length >= 2 ? 
      (minuteData[0].价格 > minuteData[minuteData.length - 1].价格 ? 'up' : 
       minuteData[0].价格 < minuteData[minuteData.length - 1].价格 ? 'down' : 'flat') : 'flat'
    
    return { latestPrice, latestChange, avgPrice, totalVolume, priceTrend }
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 页面标题 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center justify-center space-x-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            <span>实时分钟数据</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            查询股票最近20分钟的分钟级实时数据，把握市场动态和价格变化
          </p>
        </div>

        {/* 查询表单 */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
              <Search className="w-5 h-5 text-cyan-400" />
              <span>股票实时分钟数据查询</span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              输入股票代码，查询最近20分钟的分钟级实时数据（仅交易时间可用）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  股票代码
                </label>
                <div className="relative">
                  <Input
                    placeholder="例如：000001（平安银行）"
                    value={stockCode}
                    onChange={(e) => setStockCode(e.target.value)}
                    className="w-full h-10 text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleQuery} 
                  disabled={loading}
                  className="w-full h-10 text-sm bg-cyan-600 hover:bg-cyan-700 border-0"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>查询中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4" />
                      <span>查询实时数据</span>
                    </div>
                  )}
                </Button>
              </div>
              <div className="flex items-end">
                <Button 
                  variant={autoRefresh ? "default" : "outline"}
                  onClick={toggleAutoRefresh}
                  className="w-full h-10 text-sm border-2 hover:shadow-lg transition-all bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  <div className="flex items-center space-x-2">
                    {autoRefresh ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>停止自动刷新</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>开启自动刷新</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Card className="mb-6 bg-red-900/20 border-red-700">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3 text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="font-medium text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 查询结果统计 */}
        {minuteData.length > 0 && (
          <Card className="mb-6 bg-orange-900/20 border-orange-700">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center space-x-2 text-base">
                <Clock className="w-4 h-4" />
                <span>实时数据 - {stockCode}</span>
              </CardTitle>
              <CardDescription className="text-orange-300 text-sm">
                最近20分钟数据 | 总记录数：{totalRecords} 条 | 
                最后更新：{lastUpdate}
                {autoRefresh && <span className="ml-2">| 自动刷新：{refreshCount} 次</span>}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* 实时数据摘要 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-700/50 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-blue-400 mb-1">最新价格</p>
                <p className="text-lg font-bold text-white">
                  ¥{stats.latestPrice.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700/50 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-green-400 mb-1">最新涨跌幅</p>
                <p className={`text-lg font-bold ${getPriceColor(stats.latestChange)}`}>
                  {stats.latestChange > 0 ? '+' : ''}{stats.latestChange.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700/50 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-purple-400 mb-1">平均价格</p>
                <p className="text-lg font-bold text-white">
                  ¥{stats.avgPrice.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700/50 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-pink-400 mb-1">总成交量</p>
                <p className="text-lg font-bold text-white">
                  {formatNumber(stats.totalVolume)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 实时数据展示 */}
        {minuteData.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>分钟级实时数据</span>
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                最近20分钟的分钟级股票数据（仅交易时间可用）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-600">
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 rounded-l-lg text-sm">时间</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">价格</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">涨跌幅</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">涨跌额</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">成交量</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 rounded-r-lg text-sm">成交额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {minuteData.map((item, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="p-3 text-sm text-white font-medium">
                          {formatTime(item.时间)}
                        </td>
                        <td className="p-3 text-sm text-white font-semibold">
                          ¥{item.价格.toFixed(2)}
                        </td>
                        <td className={`p-3 text-sm font-medium flex items-center space-x-1 ${getPriceColor(item.涨跌幅)}`}>
                          {getPriceIcon(item.涨跌幅)}
                          <span>{item.涨跌幅 > 0 ? '+' : ''}{item.涨跌幅.toFixed(2)}%</span>
                        </td>
                        <td className={`p-3 text-sm font-medium ${getPriceColor(item.涨跌额)}`}>
                          {item.涨跌额 > 0 ? '+' : ''}¥{item.涨跌额.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm text-gray-300">
                          {formatNumber(item.成交量)}
                        </td>
                        <td className="p-3 text-sm text-gray-300">
                          {formatNumber(item.成交额)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 价格趋势指示 */}
              {stats && stats.priceTrend !== 'flat' && (
                <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">价格趋势</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {stats.priceTrend === 'up' ? (
                        <span className="text-red-400 font-medium text-sm">↗️ 上涨趋势</span>
                      ) : (
                        <span className="text-green-400 font-medium text-sm">↘️ 下跌趋势</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    基于最新价格与最早价格的比较分析
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 使用说明 */}
        <Card className="bg-gray-800/30 border-gray-600">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center space-x-2 text-base">
              <Search className="w-4 h-4" />
              <span>使用说明</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
              <div>
                <p className="font-medium mb-2 text-cyan-400">⏰ 时间说明：</p>
                <ul className="space-y-1">
                  <li>• 实时分钟数据仅在交易时间内可用</li>
                  <li>• 交易时间：9:30-11:30, 13:00-15:00</li>
                  <li>• 数据更新频率：每分钟更新一次</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2 text-cyan-400">🔄 自动刷新：</p>
                <ul className="space-y-1">
                  <li>• 开启自动刷新后，每分钟自动更新数据</li>
                  <li>• 涨跌幅：红色表示上涨，绿色表示下跌</li>
                  <li>• 价格趋势基于最新与最早价格比较</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
