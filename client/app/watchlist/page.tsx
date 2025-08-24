'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Star, Plus, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

interface StockInfo {
  stock_code: string
  stock_name: string
  current_price: string | number
  change_percent: string | number
  change_amount: string | number
  volume: string | number
  turnover: string | number
  update_time: string
}

export default function WatchlistPage() {
  const [stocks, setStocks] = useState<StockInfo[]>([])
  const [newStockCode, setNewStockCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isUpdatingNames, setIsUpdatingNames] = useState(false)
  const [sortField, setSortField] = useState<keyof StockInfo>('stock_code')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // 获取自选股票列表
  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/watchlist/list')
      const data = await response.json()
      if (data.code === '200' && data.data) {
        setStocks(data.data.map((stock: any) => ({
          stock_code: stock.stock_code,
          stock_name: stock.stock_name || stock.stock_code,
          current_price: 'N/A',
          change_percent: 'N/A',
          change_amount: 'N/A',
          volume: 'N/A',
          turnover: 'N/A',
          update_time: 'N/A'
        })))
      }
    } catch (error) {
      console.error('获取自选股票列表失败:', error)
    }
  }, [])

  // 获取股票实时信息
  const fetchStocksInfo = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('http://localhost:8000/watchlist/stocks/info')
      const data = await response.json()
      if (data.code === '200' && data.data?.stocks) {
        setStocks(data.data.stocks)
      }
    } catch (error) {
      console.error('获取股票信息失败:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // 添加股票到自选
  const addStock = async () => {
    if (!newStockCode.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/watchlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock_code: newStockCode.trim()
        })
      })
      
      const data = await response.json()
      
      if (data.code === '200') {
        setNewStockCode('')
        await fetchWatchlist()
        await fetchStocksInfo()
        alert('股票添加成功！')
      } else {
        alert(data.message || '添加失败')
      }
    } catch (error) {
      console.error('添加股票失败:', error)
      alert('添加失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  // 删除股票
  const removeStock = async (stockCode: string) => {
    if (!confirm(`确定要删除股票 ${stockCode} 吗？`)) return
    
    try {
      const response = await fetch(`http://localhost:8000/watchlist/remove/${stockCode}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.code === '200') {
        await fetchWatchlist()
        await fetchStocksInfo()
        alert('股票删除成功！')
      } else {
        alert(data.message || '删除失败')
      }
    } catch (error) {
      console.error('删除股票失败:', error)
      alert('删除失败，请检查网络连接')
    }
  }

  // 更新股票名称
  const handleUpdateNames = async () => {
    if (!confirm('确定要更新所有股票的名称吗？这可能需要一些时间。')) return
    
    setIsUpdatingNames(true)
    try {
      const response = await fetch('http://localhost:8000/watchlist/update_names', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.code === '200') {
        await fetchWatchlist()
        await fetchStocksInfo()
        alert(`股票名称更新成功！共更新了 ${data.data?.updated_count || 0} 只股票`)
      } else {
        alert(data.message || '更新失败')
      }
    } catch (error) {
      console.error('更新股票名称失败:', error)
      alert('更新失败，请检查网络连接')
    } finally {
      setIsUpdatingNames(false)
    }
  }

  // 排序功能
  const handleSort = (field: keyof StockInfo) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedStocks = [...stocks].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    
    if (aVal === 'N/A' && bVal === 'N/A') return 0
    if (aVal === 'N/A') return 1
    if (bVal === 'N/A') return -1
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    return 0
  })

  // 初始化加载
  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  // 自动刷新（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      if (stocks.length > 0) {
        fetchStocksInfo()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [stocks.length, fetchStocksInfo])

  // 手动刷新
  const handleRefresh = () => {
    fetchStocksInfo()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 添加股票区域 */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>添加股票</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                type="text"
                placeholder="请输入股票代码（如：000001）"
                value={newStockCode}
                onChange={(e) => setNewStockCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStock()}
                className="flex-1 h-10 text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={addStock} 
                disabled={isLoading || !newStockCode.trim()}
                className="h-10 px-4 text-sm bg-blue-600 hover:bg-blue-700 border-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '添加中...' : '添加'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 股票列表 */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>股票池 ({stocks.length})</span>
              </CardTitle>
              <div className="flex space-x-3">
                <Button 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-sm border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200 bg-gray-800"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? '刷新中...' : '刷新'}</span>
                </Button>
                
                <Button 
                  onClick={handleUpdateNames} 
                  disabled={isUpdatingNames}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-sm border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200 bg-gray-800"
                >
                  <Star className="w-4 h-4 mr-2" />
                  <span>{isUpdatingNames ? '更新中...' : '更新名称'}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stocks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-base text-gray-300">暂无自选股票</p>
                <p className="text-sm text-gray-500 mt-1">请在上方添加您关注的股票</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th 
                        className="px-4 py-3 text-left font-medium text-gray-300 cursor-pointer hover:bg-gray-700/50 text-sm"
                        onClick={() => handleSort('stock_code')}
                      >
                        股票代码
                        {sortField === 'stock_code' && (
                          <span className="ml-1 text-blue-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-medium text-gray-300 cursor-pointer hover:bg-gray-700/50 text-sm"
                        onClick={() => handleSort('stock_name')}
                      >
                        股票名称
                        {sortField === 'stock_name' && (
                          <span className="ml-1 text-blue-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-medium text-gray-300 cursor-pointer hover:bg-gray-700/50 text-sm"
                        onClick={() => handleSort('current_price')}
                      >
                        最新价
                        {sortField === 'current_price' && (
                          <span className="ml-1 text-blue-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-medium text-gray-300 cursor-pointer hover:bg-gray-700/50 text-sm"
                        onClick={() => handleSort('change_percent')}
                      >
                        涨跌幅
                        {sortField === 'change_percent' && (
                          <span className="ml-1 text-blue-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-medium text-gray-300 cursor-pointer hover:bg-gray-700/50 text-sm"
                        onClick={() => handleSort('change_amount')}
                      >
                        涨跌额
                        {sortField === 'change_amount' && (
                          <span className="ml-1 text-blue-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-medium text-gray-300 cursor-pointer hover:bg-gray-700/50 text-sm"
                        onClick={() => handleSort('volume')}
                      >
                        成交量
                        {sortField === 'volume' && (
                          <span className="ml-1 text-blue-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-medium text-gray-300 cursor-pointer hover:bg-gray-700/50 text-sm"
                        onClick={() => handleSort('update_time')}
                      >
                        更新时间
                        {sortField === 'update_time' && (
                          <span className="ml-1 text-blue-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-300 text-sm">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStocks.map((stock, index) => (
                      <tr key={stock.stock_code} className="border-b border-gray-700 hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-mono text-sm text-white">{stock.stock_code}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{stock.stock_name}</td>
                        <td className="px-4 py-3 font-mono text-sm text-white">
                          {stock.current_price !== 'N/A' ? `¥${stock.current_price}` : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {stock.change_percent !== 'N/A' ? (
                            <span className={`flex items-center space-x-1 ${
                              Number(stock.change_percent) > 0 ? 'text-red-400' : 
                              Number(stock.change_percent) < 0 ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              {Number(stock.change_percent) > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : Number(stock.change_percent) < 0 ? (
                                <TrendingDown className="w-3 h-3" />
                              ) : null}
                              <span>{stock.change_percent}%</span>
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {stock.change_amount !== 'N/A' ? (
                            <span className={Number(stock.change_amount) > 0 ? 'text-red-400' : 'text-green-400'}>
                              {Number(stock.change_amount) > 0 ? '+' : ''}{stock.change_amount}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {stock.volume !== 'N/A' ? `${(Number(stock.volume) / 10000).toFixed(2)}万` : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{stock.update_time}</td>
                        <td className="px-4 py-3">
                          <Button
                            onClick={() => removeStock(stock.stock_code)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-900/30 border-red-600 hover:border-red-500 transition-all duration-200 bg-gray-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>数据每30秒自动刷新 • 点击表头可排序 • 实时监控市场动态</p>
        </div>
      </main>
    </div>
  )
}