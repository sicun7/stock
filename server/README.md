# A股股票信息查询API

基于Python + FastAPI + akshare开发的A股股票信息查询服务。

## 功能特性

- 根据股票代码和日期查询指定日期的股票信息
- 查询股票最近一个月每一天的信息
- 查询股票实时最近20分钟每一分钟的信息
- RESTful API接口
- 自动API文档生成

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行服务

```bash
# 方式1：直接运行
python main.py

# 方式2：使用uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

服务启动后，可以通过以下地址访问：
- API服务：http://localhost:8000
- API文档：http://localhost:8000/docs
- 交互式API文档：http://localhost:8000/redoc

## API接口说明

### 1. 查询指定日期的股票信息

**接口地址：** `GET /stock/daily/{stock_code}`

**参数：**
- `stock_code`：股票代码（路径参数，如：000001）
- `date`：查询日期（查询参数，可选，格式：YYYY-MM-DD，为空则查询当前日期）

**示例：**
```bash
# 查询000001股票今天的数据
curl "http://localhost:8000/stock/daily/000001"

# 查询000001股票2024-01-15的数据
curl "http://localhost:8000/stock/daily/000001?date=2024-01-15"
```

### 2. 查询最近一个月的股票信息

**接口地址：** `GET /stock/monthly/{stock_code}`

**参数：**
- `stock_code`：股票代码（路径参数，如：000001）

**示例：**
```bash
# 查询000001股票最近一个月的数据
curl "http://localhost:8000/stock/monthly/000001"
```

### 3. 查询实时分钟数据

**接口地址：** `GET /stock/realtime/{stock_code}`

**参数：**
- `stock_code`：股票代码（路径参数，如：000001）

**示例：**
```bash
# 查询000001股票最近20分钟的分钟数据
curl "http://localhost:8000/stock/realtime/000001"
```

### 4. 健康检查

**接口地址：** `GET /health`

**示例：**
```bash
curl "http://localhost:8000/health"
```

## 响应格式

所有接口都返回统一的JSON格式：

```json
{
  "code": "200",
  "message": "查询成功",
  "data": {
    "stock_code": "000001",
    "date": "2024-01-15",
    "stock_data": {
      "日期": "2024-01-15",
      "开盘": 10.50,
      "收盘": 10.80,
      "最高": 11.00,
      "最低": 10.40,
      "成交量": 1000000,
      "成交额": 10800000,
      "振幅": 5.71,
      "涨跌幅": 2.86,
      "涨跌额": 0.30,
      "换手率": 1.23
    }
  }
}
```

## 股票代码说明

- 股票代码为6位数字，如：000001（平安银行）
- 支持所有A股股票代码

## 注意事项

1. 确保网络连接正常，akshare需要从网络获取数据
2. 股票数据有延迟，实时性取决于数据源
3. 非交易时间可能无法获取实时数据
4. 建议在生产环境中添加适当的缓存机制

## 开发环境

- Python 3.8+
- FastAPI 0.104.1
- akshare 1.12.0
- pandas 2.1.3

## 许可证

MIT License 