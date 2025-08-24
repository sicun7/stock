"""
A股股票信息查询API配置文件
"""

import os
from typing import Optional

class Config:
    """应用配置类"""
    
    # 服务配置
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # API配置
    API_TITLE: str = "A股股票信息查询API"
    API_DESCRIPTION: str = "基于akshare的A股股票数据查询服务"
    API_VERSION: str = "1.0.0"
    
    # 日志配置
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # 数据源配置
    AKSHARE_TIMEOUT: int = int(os.getenv("AKSHARE_TIMEOUT", "30"))
    
    # 缓存配置（可选）
    ENABLE_CACHE: bool = os.getenv("ENABLE_CACHE", "False").lower() == "true"
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "300"))  # 5分钟
    
    # 安全配置
    ALLOW_ORIGINS: list = ["*"]  # CORS允许的源
    ALLOW_CREDENTIALS: bool = True
    ALLOW_METHODS: list = ["*"]
    ALLOW_HEADERS: list = ["*"]
    
    @classmethod
    def get_database_url(cls) -> Optional[str]:
        """获取数据库URL（如果配置了数据库）"""
        return os.getenv("DATABASE_URL")
    
    @classmethod
    def is_production(cls) -> bool:
        """判断是否为生产环境"""
        return os.getenv("ENVIRONMENT", "development") == "production"

# 创建配置实例
config = Config() 