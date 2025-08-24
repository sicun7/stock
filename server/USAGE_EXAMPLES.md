# A股股票信息查询API使用示例

## 快速开始

### 1. 启动服务

```bash
# 方式1：使用启动脚本
./start.sh

# 方式2：直接运行
python main.py

# 方式3：使用Docker
docker-compose up
```

### 2. 访问API文档

打开浏览器访问：http://localhost:8000/docs

## API使用示例

### 1. 查询指定日期的股票信息

```bash
# 查询平安银行(000001)今天的数据
curl "http://localhost:8000/stock/daily/000001"

# 查询平安银行(000001)指定日期的数据
curl "http://localhost:8000/stock/daily/000001?date=2024-08-22"

# 查询万科A(000002)指定日期的数据
curl "http://localhost:8000/stock/daily/000002?date=2024-08-22"
```

**响应示例：**
```json
{
  "code": "200",
  "message": "查询成功",
  "data": {
    "stock_code": "000001",
    "date": "2024-08-22",
    "stock_data": {
      "日期": "2024-08-22",
      "股票代码": "000001",
      "开盘": 12.15,
      "收盘": 12.06,
      "最高": 12.17,
      "最低": 11.98,
      "成交量": 1644260,
      "成交额": 1979461310.91,
      "振幅": 1.56,
      "涨跌幅": -0.74,
      "涨跌额": -0.09,
      "换手率": 0.85
    }
  }
}
```

### 2. 查询最近一个月的股票信息

```bash
# 查询平安银行(000001)最近一个月的数据
curl "http://localhost:8000/stock/monthly/000001"

# 查询万科A(000002)最近一个月的数据
curl "http://localhost:8000/stock/monthly/000002"
```

**响应示例：**
```json
{
  "code": "200",
  "message": "查询成功",
  "data": {
    "stock_code": "000001",
    "period": "2025-07-24 到 2025-08-23",
    "total_records": 22,
    "stock_data": [
      {
        "日期": "2025-07-24",
        "股票代码": "000001",
        "开盘": 12.53,
        "收盘": 12.35,
        "最高": 12.53,
        "最低": 12.33,
        "成交量": 1959351,
        "成交额": 2426175235.74,
        "振幅": 1.6,
        "涨跌幅": -1.44,
        "涨跌额": -0.18,
        "换手率": 1.01
      }
      // ... 更多数据
    ]
  }
}
```

### 3. 查询实时分钟数据

```bash
# 查询平安银行(000001)最近20分钟的分钟数据
curl "http://localhost:8000/stock/realtime/000001"
```

**注意：** 实时分钟数据仅在交易时间内可用。

### 4. 健康检查

```bash
# 检查服务状态
curl "http://localhost:8000/health"
```

**响应示例：**
```json
{
  "code": "200",
  "message": "服务健康",
  "data": {
    "status": "healthy",
    "timestamp": "2025-08-23T23:07:02.676619"
  }
}
```

## 常用股票代码

| 股票代码 | 股票名称 | 交易所 |
|---------|---------|--------|
| 000001  | 平安银行 | 深交所 |
| 000002  | 万科A   | 深交所 |
| 000858  | 五粮液  | 深交所 |
| 002415  | 海康威视 | 深交所 |
| 600000  | 浦发银行 | 上交所 |
| 600036  | 招商银行 | 上交所 |
| 600519  | 贵州茅台 | 上交所 |
| 600887  | 伊利股份 | 上交所 |

## 错误处理

### 1. 无效股票代码

```bash
curl "http://localhost:8000/stock/daily/invalid"
```

**响应：**
```json
{
  "detail": "查询失败: 400: 股票代码必须为数字"
}
```

### 2. 无效日期格式

```bash
curl "http://localhost:8000/stock/daily/000001?date=2024-13-45"
```

**响应：**
```json
{
  "detail": "查询失败: 400: 日期格式错误，请使用YYYY-MM-DD格式"
}
```

### 3. 无数据

```bash
curl "http://localhost:8000/stock/daily/000001"
```

**响应：**
```json
{
  "code": "404",
  "message": "未找到股票 000001 在 今天 的数据",
  "data": null
}
```

## 编程语言示例

### Python示例

```python
import requests
import json

# 查询股票日线数据
def get_stock_daily(stock_code, date=None):
    url = f"http://localhost:8000/stock/daily/{stock_code}"
    if date:
        url += f"?date={date}"
    
    response = requests.get(url)
    return response.json()

# 查询股票月线数据
def get_stock_monthly(stock_code):
    url = f"http://localhost:8000/stock/monthly/{stock_code}"
    response = requests.get(url)
    return response.json()

# 使用示例
if __name__ == "__main__":
    # 查询平安银行今天的数据
    result = get_stock_daily("000001")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 查询平安银行指定日期的数据
    result = get_stock_daily("000001", "2024-08-22")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 查询平安银行最近一个月的数据
    result = get_stock_monthly("000001")
    print(json.dumps(result, indent=2, ensure_ascii=False))
```

### JavaScript示例

```javascript
// 查询股票日线数据
async function getStockDaily(stockCode, date = null) {
    let url = `http://localhost:8000/stock/daily/${stockCode}`;
    if (date) {
        url += `?date=${date}`;
    }
    
    const response = await fetch(url);
    return await response.json();
}

// 查询股票月线数据
async function getStockMonthly(stockCode) {
    const url = `http://localhost:8000/stock/monthly/${stockCode}`;
    const response = await fetch(url);
    return await response.json();
}

// 使用示例
async function main() {
    try {
        // 查询平安银行今天的数据
        const result1 = await getStockDaily("000001");
        console.log(JSON.stringify(result1, null, 2));
        
        // 查询平安银行指定日期的数据
        const result2 = await getStockDaily("000001", "2024-08-22");
        console.log(JSON.stringify(result2, null, 2));
        
        // 查询平安银行最近一个月的数据
        const result3 = await getStockMonthly("000001");
        console.log(JSON.stringify(result3, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
```

## 注意事项

1. **交易时间**：股票数据仅在交易时间内更新，非交易时间可能无法获取最新数据
2. **数据延迟**：实时数据有延迟，具体延迟时间取决于数据源
3. **请求频率**：建议控制请求频率，避免对服务器造成过大压力
4. **错误处理**：请妥善处理API返回的错误信息
5. **数据格式**：所有数据均为JSON格式，请确保正确处理编码

## 测试

运行测试脚本验证API功能：

```bash
python test_api.py
```

这将测试所有API接口的功能和错误处理。 