'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Calendar, BarChart3, Clock } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo和标题 */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                A股股票信息查询
              </h1>
              <p className="text-xs text-gray-400">专业 · 实时 · 精准</p>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/daily"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                isActive('/daily') 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>日线数据</span>
            </Link>
            
            <Link 
              href="/monthly"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                isActive('/monthly') 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>月度数据</span>
            </Link>
            
            <Link 
              href="/realtime"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                isActive('/realtime') 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>实时数据</span>
            </Link>
          </nav>

          {/* 右侧信息 */}
          <div className="text-right">
            <p className="text-xs text-gray-400">数据驱动投资决策</p>
            <p className="text-xs text-gray-500">实时更新 · 专业分析</p>
          </div>
        </div>

        {/* 移动端菜单 */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-2 overflow-x-auto">
            <Link 
              href="/daily"
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-300 flex items-center space-x-2 ${
                isActive('/daily') 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>日线数据</span>
            </Link>
            
            <Link 
              href="/monthly"
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-300 flex items-center space-x-2 ${
                isActive('/monthly') 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>月度数据</span>
            </Link>
            
            <Link 
              href="/realtime"
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-300 flex items-center space-x-2 ${
                isActive('/realtime') 
                  ? 'bg-cyan-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>实时数据</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
