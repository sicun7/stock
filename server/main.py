from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import akshare as ak
import pandas as pd
from datetime import datetime, timedelta
import logging
from config import config

# 配置日志
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format=config.LOG_FORMAT
)
logger = logging.getLogger(__name__)

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=config.HOST, 
        port=config.PORT,
        reload=config.DEBUG
    ) 