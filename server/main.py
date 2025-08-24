from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import akshare as ak
import pandas as pd
from datetime import datetime, timedelta
import logging
import sqlite3
import os
from config import config

# 配置日志
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format=config.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# 数据库初始化
def init_database():
    """初始化SQLite数据库"""
    db_path = "stock_pool.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 创建自选股票表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stock_code TEXT UNIQUE NOT NULL,
            stock_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("数据库初始化完成")

def get_stock_name(stock_code: str) -> str:
    """
    获取股票的中文名称
    
    Args:
        stock_code: 股票代码
        
    Returns:
        股票中文名称，如果获取失败则返回股票代码
    """
    # 方法1: 优先使用内置映射（最可靠）
    common_stocks = {
        '000001': '平安银行',
        '000002': '万科A',
        '000858': '五粮液',
        '600036': '招商银行',
        '600519': '贵州茅台',
        '000333': '美的集团',
        '002415': '海康威视',
        '000725': '京东方A',
        '002594': '比亚迪',
        '300059': '东方财富',
        '000776': '广发证券',
        '002230': '科大讯飞',
        '300760': '迈瑞医疗',
        '000661': '长春高新',
        '002008': '大族激光',
        '300015': '爱尔眼科',
        '300024': '机器人',
        '300454': '深信服',
        '300474': '景嘉微',
        '000001': '平安银行',
        '000002': '万科A',
        '000858': '五粮液',
        '600036': '招商银行',
        '600519': '贵州茅台',
        '000333': '美的集团',
        '002415': '海康威视',
        '000725': '京东方A',
        '002594': '比亚迪',
        '300059': '东方财富',
        '000776': '广发证券',
        '002230': '科大讯飞',
        '300760': '迈瑞医疗',
        '000661': '长春高新',
        '002008': '大族激光',
        '300015': '爱尔眼科',
        '300024': '机器人',
        '300454': '深信服',
        '300474': '景嘉微'
    }
    
    if stock_code in common_stocks:
        logger.info(f"使用内置映射获取股票名称: {common_stocks[stock_code]}")
        return common_stocks[stock_code]
    
    try:
        # 方法2: 使用股票基本信息接口
        stock_info = ak.stock_individual_info_em(symbol=stock_code)
        if not stock_info.empty:
            logger.info(f"股票 {stock_code} 基本信息: {stock_info.to_dict('records')}")
            
            # 查找包含"名称"或"股票名称"的列
            for col in stock_info.columns:
                if '名称' in col or '股票名称' in col:
                    stock_name = stock_info.iloc[0][col]
                    if stock_name and str(stock_name) != 'nan':
                        logger.info(f"从列 '{col}' 获取到股票名称: {stock_name}")
                        return str(stock_name)
            
            # 如果没有找到名称列，尝试使用第一列的值
            first_value = stock_info.iloc[0].iloc[0]
            if first_value and str(first_value) != 'nan' and str(first_value) != stock_code:
                logger.info(f"使用第一列值作为股票名称: {first_value}")
                return str(first_value)
        
        # 方法3: 使用股票列表接口
        try:
            stock_list = ak.stock_zh_a_spot_em()
            stock_row = stock_list[stock_list['代码'] == stock_code]
            if not stock_row.empty:
                stock_name = stock_row.iloc[0]['名称']
                if stock_name and str(stock_name) != 'nan':
                    logger.info(f"从股票列表获取到股票名称: {stock_name}")
                    return str(stock_name)
        except Exception as e:
            logger.warning(f"方法2获取股票名称失败: {str(e)}")
        
        logger.warning(f"无法获取股票 {stock_code} 的名称")
        return stock_code
        
    except Exception as e:
        logger.warning(f"获取股票 {stock_code} 名称失败: {str(e)}")
        return stock_code

# 启动时初始化数据库
init_database()

app = FastAPI(
    title=config.API_TITLE,
    description=config.API_DESCRIPTION,
    version=config.API_VERSION
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOW_ORIGINS,
    allow_credentials=config.ALLOW_CREDENTIALS,
    allow_methods=config.ALLOW_METHODS,
    allow_headers=config.ALLOW_HEADERS,
)

class StockResponse(BaseModel):
    code: str
    message: str
    data: Optional[Dict[str, Any]] = None

class WatchlistStock(BaseModel):
    stock_code: str
    stock_name: Optional[str] = None

class WatchlistResponse(BaseModel):
    code: str
    message: str
    data: Optional[List[WatchlistStock]] = None

@app.get("/", response_model=StockResponse)
async def root():
    """API根路径，返回服务信息"""
    return StockResponse(
        code="200",
        message="A股股票信息查询API服务运行正常",
        data={
            "version": "1.0.0",
            "endpoints": [
                "/stock/daily/{stock_code}",
                "/stock/monthly/{stock_code}",
                "/stock/realtime/{stock_code}"
            ]
        }
    )

@app.get("/stock/daily/{stock_code}", response_model=StockResponse)
async def get_stock_daily(
    stock_code: str,
    date: Optional[str] = Query(None, description="查询日期，格式：YYYY-MM-DD，为空则查询当前日期")
):
    """
    根据股票代码和日期查询该股票指定日期的实时信息
    
    Args:
        stock_code: 股票代码（如：000001）
        date: 查询日期，格式YYYY-MM-DD，为空则查询当前日期
    """
    try:
        # 处理股票代码格式
        if not stock_code.isdigit():
            raise HTTPException(status_code=400, detail="股票代码必须为数字")
        
        # 处理日期参数
        if date is None:
            query_date = datetime.now().strftime("%Y%m%d")
        else:
            try:
                # 将YYYY-MM-DD格式转换为YYYYMMDD
                date_obj = datetime.strptime(date, "%Y-%m-%d")
                query_date = date_obj.strftime("%Y%m%d")
            except ValueError:
                raise HTTPException(status_code=400, detail="日期格式错误，请使用YYYY-MM-DD格式")
        
        logger.info(f"查询股票 {stock_code} 在 {query_date} 的日线数据")
        
        # 使用akshare获取股票日线数据
        stock_data = ak.stock_zh_a_hist(symbol=stock_code, period="daily", start_date=query_date, end_date=query_date, adjust="qfq")
        
        if stock_data.empty:
            return StockResponse(
                code="404",
                message=f"未找到股票 {stock_code} 在 {date or '今天'} 的数据",
                data=None
            )
        
        # 转换数据格式
        result = stock_data.to_dict('records')[0] if len(stock_data) > 0 else {}
        
        return StockResponse(
            code="200",
            message="查询成功",
            data={
                "stock_code": stock_code,
                "date": date or datetime.now().strftime("%Y-%m-%d"),
                "stock_data": result
            }
        )
        
    except Exception as e:
        logger.error(f"查询股票日线数据失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@app.get("/stock/monthly/{stock_code}", response_model=StockResponse)
async def get_stock_monthly(stock_code: str):
    """
    根据股票代码查询该股票最近一个月每一天的信息
    
    Args:
        stock_code: 股票代码（如：000001）
    """
    try:
        # 处理股票代码格式
        if not stock_code.isdigit():
            raise HTTPException(status_code=400, detail="股票代码必须为数字")
        
        # 计算最近一个月的日期范围
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        start_date_str = start_date.strftime("%Y%m%d")
        end_date_str = end_date.strftime("%Y%m%d")
        
        logger.info(f"查询股票 {stock_code} 从 {start_date_str} 到 {end_date_str} 的月线数据")
        
        # 使用akshare获取股票日线数据
        stock_data = ak.stock_zh_a_hist(symbol=stock_code, period="daily", start_date=start_date_str, end_date=end_date_str, adjust="qfq")
        
        if stock_data.empty:
            return StockResponse(
                code="404",
                message=f"未找到股票 {stock_code} 最近一个月的数据",
                data=None
            )
        
        # 转换数据格式
        result = stock_data.to_dict('records')
        
        return StockResponse(
            code="200",
            message="查询成功",
            data={
                "stock_code": stock_code,
                "period": f"{start_date.strftime('%Y-%m-%d')} 到 {end_date.strftime('%Y-%m-%d')}",
                "total_records": len(result),
                "stock_data": result
            }
        )
        
    except Exception as e:
        logger.error(f"查询股票月线数据失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@app.get("/stock/realtime/{stock_code}", response_model=StockResponse)
async def get_stock_realtime(stock_code: str):
    """
    根据股票代码查询该股票实时最近20分钟每一分钟的信息
    
    Args:
        stock_code: 股票代码（如：000001）
    """
    try:
        # 处理股票代码格式
        if not stock_code.isdigit():
            raise HTTPException(status_code=400, detail="股票代码必须为数字")
        
        logger.info(f"查询股票 {stock_code} 的实时分钟数据")
        
        # 使用akshare获取股票实时分钟数据
        # 注意：akshare的分钟数据可能需要特殊处理，这里使用分时数据
        stock_data = ak.stock_zh_a_minute(symbol=stock_code, period='1', adjust='qfq')
        
        if stock_data.empty:
            return StockResponse(
                code="404",
                message=f"未找到股票 {stock_code} 的实时分钟数据",
                data=None
            )
        
        # 获取最近20分钟的数据
        recent_data = stock_data.tail(20)
        
        # 转换数据格式
        result = recent_data.to_dict('records')
        
        return StockResponse(
            code="200",
            message="查询成功",
            data={
                "stock_code": stock_code,
                "period": "最近20分钟",
                "total_records": len(result),
                "stock_data": result
            }
        )
        
    except Exception as e:
        logger.error(f"查询股票实时数据失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@app.get("/health", response_model=StockResponse)
async def health_check():
    """健康检查接口"""
    return StockResponse(
        code="200",
        message="服务健康",
        data={"status": "healthy", "timestamp": datetime.now().isoformat()}
    )

@app.post("/watchlist/add", response_model=StockResponse)
async def add_to_watchlist(stock: WatchlistStock):
    """
    将要添加的股票代码加入股票池
    
    Args:
        stock: 股票信息，包含股票代码和名称
    """
    try:
        # 验证股票代码格式
        if not stock.stock_code.isdigit():
            raise HTTPException(status_code=400, detail="股票代码必须为数字")
        
        db_path = "stock_pool.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查是否已存在
        cursor.execute("SELECT stock_code FROM watchlist WHERE stock_code = ?", (stock.stock_code,))
        if cursor.fetchone():
            conn.close()
            return StockResponse(
                code="400",
                message="股票代码已存在于自选股票池中",
                data={"stock_code": stock.stock_code}
            )
        
        # 获取股票名称（如果未提供）
        stock_name = stock.stock_name
        if not stock_name:
            try:
                # 使用akshare获取股票名称
                stock_name = get_stock_name(stock.stock_code)
            except:
                stock_name = stock.stock_code
        
        # 插入新记录
        cursor.execute(
            "INSERT INTO watchlist (stock_code, stock_name) VALUES (?, ?)",
            (stock.stock_code, stock_name)
        )
        
        conn.commit()
        conn.close()
        
        logger.info(f"成功添加股票 {stock.stock_code} 到自选股票池")
        
        return StockResponse(
            code="200",
            message="成功添加到自选股票池",
            data={
                "stock_code": stock.stock_code,
                "stock_name": stock_name
            }
        )
        
    except Exception as e:
        logger.error(f"添加股票到自选股票池失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"添加失败: {str(e)}")

@app.get("/watchlist/list", response_model=WatchlistResponse)
async def get_watchlist():
    """
    获取股票池里的股票列表
    """
    try:
        db_path = "stock_pool.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT stock_code, stock_name FROM watchlist ORDER BY created_at DESC")
        rows = cursor.fetchall()
        
        conn.close()
        
        stocks = [WatchlistStock(stock_code=row[0], stock_name=row[1]) for row in rows]
        
        return WatchlistResponse(
            code="200",
            message="获取自选股票列表成功",
            data=stocks
        )
        
    except Exception as e:
        logger.error(f"获取自选股票列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取失败: {str(e)}")

@app.delete("/watchlist/remove/{stock_code}", response_model=StockResponse)
async def remove_from_watchlist(stock_code: str):
    """
    根据股票代码从股票池里删除
    
    Args:
        stock_code: 股票代码
    """
    try:
        # 验证股票代码格式
        if not stock_code.isdigit():
            raise HTTPException(status_code=400, detail="股票代码必须为数字")
        
        db_path = "stock_pool.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查是否存在
        cursor.execute("SELECT stock_code FROM watchlist WHERE stock_code = ?", (stock_code,))
        if not cursor.fetchone():
            conn.close()
            return StockResponse(
                code="404",
                message="股票代码不存在于自选股票池中",
                data={"stock_code": stock_code}
            )
        
        # 删除记录
        cursor.execute("DELETE FROM watchlist WHERE stock_code = ?", (stock_code,))
        
        conn.commit()
        conn.close()
        
        logger.info(f"成功从自选股票池删除股票 {stock_code}")
        
        return StockResponse(
            code="200",
            message="成功从自选股票池删除",
            data={"stock_code": stock_code}
        )
        
    except Exception as e:
        logger.error(f"从自选股票池删除股票失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")

@app.get("/watchlist/stocks/info", response_model=StockResponse)
async def get_watchlist_stocks_info():
    """
    获取自选股票池中所有股票的实时信息
    """
    try:
        db_path = "stock_pool.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT stock_code, stock_name FROM watchlist")
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return StockResponse(
                code="200",
                message="自选股票池为空",
                data={"stocks": []}
            )
        
        stocks_info = []
        for row in rows:
            stock_code = row[0]
            stock_name = row[1]
            
            try:
                # 获取股票实时信息
                stock_data = ak.stock_zh_a_spot_em()
                stock_info = stock_data[stock_data['代码'] == stock_code]
                
                if not stock_info.empty:
                    stock_row = stock_info.iloc[0]
                    stocks_info.append({
                        "stock_code": stock_code,
                        "stock_name": stock_name,
                        "current_price": stock_row.get('最新价', 'N/A'),
                        "change_percent": stock_row.get('涨跌幅', 'N/A'),
                        "change_amount": stock_row.get('涨跌额', 'N/A'),
                        "volume": stock_row.get('成交量', 'N/A'),
                        "turnover": stock_row.get('成交额', 'N/A'),
                        "update_time": datetime.now().strftime("%H:%M:%S")
                    })
                else:
                    stocks_info.append({
                        "stock_code": stock_code,
                        "stock_name": stock_name,
                        "current_price": "N/A",
                        "change_percent": "N/A",
                        "change_amount": "N/A",
                        "volume": "N/A",
                        "turnover": "N/A",
                        "update_time": datetime.now().strftime("%H:%M:%S")
                    })
            except Exception as e:
                logger.warning(f"获取股票 {stock_code} 信息失败: {str(e)}")
                stocks_info.append({
                    "stock_code": stock_code,
                    "stock_name": stock_name,
                    "current_price": "N/A",
                    "change_percent": "N/A",
                    "change_amount": "N/A",
                    "volume": "N/A",
                    "turnover": "N/A",
                    "update_time": datetime.now().strftime("%H:%M:%S")
                })
        
        return StockResponse(
            code="200",
            message="获取自选股票信息成功",
            data={"stocks": stocks_info}
        )
        
    except Exception as e:
        logger.error(f"获取自选股票信息失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取失败: {str(e)}")

@app.post("/watchlist/update_names", response_model=StockResponse)
async def update_stock_names():
    """
    更新自选股票池中所有股票的名称
    """
    try:
        db_path = "stock_pool.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取所有股票代码
        cursor.execute("SELECT stock_code FROM watchlist")
        rows = cursor.fetchall()
        
        if not rows:
            conn.close()
            return StockResponse(
                code="200",
                message="自选股票池为空，无需更新",
                data={"updated_count": 0}
            )
        
        updated_count = 0
        for row in rows:
            stock_code = row[0]
            try:
                # 获取新的股票名称
                new_name = get_stock_name(stock_code)
                
                # 更新数据库中的名称
                cursor.execute(
                    "UPDATE watchlist SET stock_name = ?, updated_at = CURRENT_TIMESTAMP WHERE stock_code = ?",
                    (new_name, stock_code)
                )
                
                if new_name != stock_code:  # 如果名称发生了变化
                    updated_count += 1
                    logger.info(f"更新股票 {stock_code} 名称为: {new_name}")
                
            except Exception as e:
                logger.warning(f"更新股票 {stock_code} 名称失败: {str(e)}")
                continue
        
        conn.commit()
        conn.close()
        
        return StockResponse(
            code="200",
            message=f"股票名称更新完成，共更新 {updated_count} 只股票",
            data={"updated_count": updated_count}
        )
        
    except Exception as e:
        logger.error(f"更新股票名称失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"更新失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=config.HOST, 
        port=config.PORT,
        reload=config.DEBUG
    ) 