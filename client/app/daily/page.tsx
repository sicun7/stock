'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Activity } from 'lucide-react'

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
    date: string
    stock_data: StockData
  }
}

export default function DailyPage() {
  const [stockCode, setStockCode] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const handleQuery = async () => {
    if (!stockCode.trim()) {
      setError('请输入股票代码')
      return
    }

    setLoading(true)
    setError('')
    setStockData(null)

    try {
      const url = date
        ? `http://localhost:8000/stock/daily/${stockCode.trim()}?date=${date}`
        : `http://localhost:8000/stock/daily/${stockCode.trim()}`

      const response = await fetch(url)
      const data: ApiResponse = await response.json()

      if (data.code === '200') {
        setStockData(data.data.stock_data)
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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 查询表单 */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
              <Search className="w-5 h-5 text-blue-400" />
              <span>股票日线数据查询</span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              输入股票代码和日期，查询指定日期的股票详细信息
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
                    className="w-full h-10 text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  查询日期
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={today}
                  className="w-full h-10 text-sm bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleQuery}
                  disabled={loading}
                  className="w-full h-10 text-sm bg-blue-600 hover:bg-blue-700 border-0"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>查询中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4" />
                      <span>开始查询</span>
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

        {/* 股票数据展示 */}
        {stockData && (
          <div className="space-y-6 mb-6">
            {/* 主要数据卡片 */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white">
                      {stockData.股票代码} - {stockData.日期}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm mt-1">
                      股票日线数据详情
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getPriceColor(stockData.涨跌幅)} flex items-center space-x-2`}>
                      {getPriceIcon(stockData.涨跌幅)}
                      <span>{stockData.涨跌幅 > 0 ? '+' : ''}{stockData.涨跌幅.toFixed(2)}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stockData.涨跌额 > 0 ? '+' : ''}¥{stockData.涨跌额.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 价格数据网格 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-blue-400 mb-1 font-medium">开盘价</p>
                    <p className="text-lg font-bold text-white">
                      ¥{stockData.开盘.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-green-400 mb-1 font-medium">收盘价</p>
                    <p className="text-lg font-bold text-white">
                      ¥{stockData.收盘.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-purple-400 mb-1 font-medium">最高价</p>
                    <p className="text-lg font-bold text-white">
                      ¥{stockData.最高.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-orange-400 mb-1 font-medium">最低价</p>
                    <p className="text-lg font-bold text-white">
                      ¥{stockData.最低.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* 交易数据网格 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-indigo-400 mb-1 font-medium">成交量</p>
                    <p className="text-sm font-bold text-white">
                      {formatNumber(stockData.成交量)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-pink-400 mb-1 font-medium">成交额</p>
                    <p className="text-sm font-bold text-white">
                      {formatNumber(stockData.成交额)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-teal-400 mb-1 font-medium">振幅</p>
                    <p className="text-sm font-bold text-white">
                      {stockData.振幅.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-amber-400 mb-1 font-medium">换手率</p>
                    <p className="text-sm font-bold text-white">
                      {stockData.换手率.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* 涨跌额展示 */}
                <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">涨跌额</span>
                    </div>
                    <span className={`text-lg font-bold ${getPriceColor(stockData.涨跌额)}`}>
                      {stockData.涨跌额 > 0 ? '+' : ''}¥{stockData.涨跌额.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 使用说明 */}
        <Card className="bg-gray-800/30 border-gray-600">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center space-x-2 text-base">
              <Search className="w-4 h-4" />
              <span>使用说明</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
              <div>
                <p className="font-medium mb-2 text-blue-400">📊 数据说明：</p>
                <ul className="space-y-1">
                  <li>• 涨跌幅：正数表示上涨，负数表示下跌</li>
                  <li>• 振幅：当日最高价与最低价的差值百分比</li>
                  <li>• 换手率：成交量与流通股本的比率</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2 text-blue-400">💡 使用技巧：</p>
                <ul className="space-y-1">
                  <li>• 股票代码格式：6位数字，如 000001</li>
                  <li>• 日期可选，不填则查询今天的数据</li>
                  <li>• 数据来源于后端API服务</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
