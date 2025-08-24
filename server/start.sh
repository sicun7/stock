#!/bin/bash

echo "启动A股股票信息查询API服务..."

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查是否在虚拟环境中
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "警告: 建议在虚拟环境中运行"
    echo "如果还没有创建虚拟环境，可以运行: python3 -m venv .venv && source .venv/bin/activate"
fi

# 安装依赖
echo "安装依赖包..."
pip install -r requirements.txt

# 启动服务
echo "启动服务..."
echo "服务地址: http://localhost:8000"
echo "API文档: http://localhost:8000/docs"
echo "按 Ctrl+C 停止服务"
echo ""

python main.py 