'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, TrendingUp, TrendingDown, Minus, BarChart3, Calendar, PieChart, Activity } from 'lucide-react'

interface StockData {
  日期: string
  股票代码: string
  开盘: number
  收盘: number
  最高: number
  最低: number
  成交量: number
  成交额: number
  振幅: number
  涨跌幅: number
  涨跌额: number
  换手率: number
}

interface ApiResponse {
  code: string
  message: string
  data: {
    stock_code: string
    period: string
    total_records: number
    stock_data: StockData[]
  }
}

export default function MonthlyPage() {
  const [stockCode, setStockCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [stockData, setStockData] = useState<StockData[]>([])
  const [period, setPeriod] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [error, setError] = useState('')

  const handleQuery = async () => {
    if (!stockCode.trim()) {
      setError('请输入股票代码')
      return
    }

    setLoading(true)
    setError('')
    setStockData([])

    try {
      const response = await fetch(`http://localhost:8000/stock/monthly/${stockCode.trim()}`)
      const data: ApiResponse = await response.json()

      if (data.code === '200') {
        setStockData(data.data.stock_data)
        setPeriod(data.data.period)
        setTotalRecords(data.data.total_records)
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit' 
    })
  }

  const calculateStats = () => {
    if (stockData.length === 0) return null
    
    const upDays = stockData.filter(item => item.涨跌幅 > 0).length
    const downDays = stockData.filter(item => item.涨跌幅 < 0).length
    const flatDays = stockData.filter(item => item.涨跌幅 === 0).length
    const avgChange = stockData.reduce((sum, item) => sum + item.涨跌幅, 0) / stockData.length
    const totalVolume = stockData.reduce((sum, item) => sum + item.成交量, 0)
    const totalAmount = stockData.reduce((sum, item) => sum + item.成交额, 0)
    
    return { upDays, downDays, flatDays, avgChange, totalVolume, totalAmount }
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 页面标题 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center justify-center space-x-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>月度数据查询</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            查询股票最近一个月的每日数据记录，全面了解股票走势和趋势变化
          </p>
        </div>

        {/* 查询表单 */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
              <Search className="w-5 h-5 text-purple-400" />
              <span>股票月度数据查询</span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              输入股票代码，查询最近一个月的每日数据记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  股票代码
                </label>
                <div className="relative">
                  <Input
                    placeholder="例如：000001（平安银行）"
                    value={stockCode}
                    onChange={(e) => setStockCode(e.target.value)}
                    className="w-full h-10 text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
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
                  className="w-full h-10 text-sm bg-purple-600 hover:bg-purple-700 border-0"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>查询中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4" />
                      <span>查询月度数据</span>
                    </div>
                  )}
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
        {stockData.length > 0 && (
          <Card className="mb-6 bg-green-900/20 border-green-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center space-x-2 text-base">
                <Calendar className="w-4 h-4" />
                <span>查询结果 - {stockCode}</span>
              </CardTitle>
              <CardDescription className="text-green-300 text-sm">
                统计期间：{period} | 总记录数：{totalRecords} 条
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* 数据摘要统计 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-700/50 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-blue-400 mb-1">上涨天数</p>
                <p className="text-lg font-bold text-white">{stats.upDays} 天</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700/50 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-green-400 mb-1">下跌天数</p>
                <p className="text-lg font-bold text-white">{stats.downDays} 天</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700/50 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Minus className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-purple-400 mb-1">平盘天数</p>
                <p className="text-lg font-bold text-white">{stats.flatDays} 天</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700/50 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-orange-400 mb-1">平均涨跌幅</p>
                <p className={`text-lg font-bold ${getPriceColor(stats.avgChange)}`}>
                  {stats.avgChange.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 股票数据表格 */}
        {stockData.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>月度数据详情</span>
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                最近一个月的每日股票数据记录（按时间倒序排列）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-600">
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 rounded-l-lg text-sm">日期</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">开盘</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">收盘</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">最高</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">最低</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">涨跌幅</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 text-sm">成交量</th>
                      <th className="text-left p-3 font-semibold text-gray-300 bg-gray-700/50 rounded-r-lg text-sm">成交额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...stockData]
                      .sort((a, b) => new Date(b.日期).getTime() - new Date(a.日期).getTime())
                      .map((item, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="p-3 text-sm text-white font-medium">
                          {formatDate(item.日期)}
                        </td>
                        <td className="p-3 text-sm text-gray-300">
                          ¥{item.开盘.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm text-gray-300">
                          ¥{item.收盘.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm text-gray-300">
                          ¥{item.最高.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm text-gray-300">
                          ¥{item.最低.toFixed(2)}
                        </td>
                        <td className={`p-3 text-sm font-medium flex items-center space-x-1 ${getPriceColor(item.涨跌幅)}`}>
                          {getPriceIcon(item.涨跌幅)}
                          <span>{item.涨跌幅 > 0 ? '+' : ''}{item.涨跌幅.toFixed(2)}%</span>
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
            </CardContent>
          </Card>
        )}

        {/* 使用说明 */}
        <Card className="bg-gray-800/30 border-gray-600">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center space-x-2 text-base">
              <Search className="w-4 h-4" />
              <span>使用说明</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
              <div>
                <p className="font-medium mb-2 text-purple-400">📊 数据说明：</p>
                <ul className="space-y-1">
                  <li>• 数据按日期倒序排列，最新数据在前</li>
                  <li>• 涨跌幅统计：红色表示上涨，绿色表示下跌</li>
                  <li>• 成交量、成交额已自动转换为万/亿单位</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2 text-purple-400">💡 分析技巧：</p>
                <ul className="space-y-1">
                  <li>• 通过胜率了解股票整体表现</li>
                  <li>• 观察成交量和成交额的变化趋势</li>
                  <li>• 关注连续上涨或下跌的天数</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
