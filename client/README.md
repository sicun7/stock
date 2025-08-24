# A股股票信息查询前端

这是一个基于 Next.js 和 Shadcn UI 的 A 股股票信息查询网站前端项目。

## 功能特性

- 📅 **日线数据查询**: 根据股票代码和日期查询指定日期的股票信息
- 📊 **月度数据查询**: 查询股票最近一个月的每日数据记录
- ⚡ **实时分钟数据**: 查询股票最近20分钟的分钟级实时数据
- 🎨 **美观界面**: 使用 Shadcn UI 组件库，界面美观且交互体验良好
- 📱 **响应式设计**: 支持桌面端和移动端访问

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI组件**: Shadcn UI
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **状态管理**: React Hooks

## 项目结构

```
client/
├── app/                    # Next.js App Router 目录
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/             # 组件目录
│   ├── ui/                # Shadcn UI 基础组件
│   │   ├── button.tsx     # 按钮组件
│   │   ├── card.tsx       # 卡片组件
│   │   ├── input.tsx      # 输入框组件
│   │   └── tabs.tsx       # 标签页组件
│   ├── DailyStockQuery.tsx    # 日线数据查询组件
│   ├── MonthlyStockQuery.tsx  # 月度数据查询组件
│   └── RealtimeStockQuery.tsx # 实时数据查询组件
├── lib/                   # 工具函数
│   └── utils.ts           # 通用工具函数
├── package.json           # 项目依赖
├── tailwind.config.js     # Tailwind CSS 配置
├── postcss.config.js      # PostCSS 配置
├── tsconfig.json          # TypeScript 配置
└── next.config.js         # Next.js 配置
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:8001 启动

### 3. 构建生产版本

```bash
npm run build
npm start
```

## API 接口

项目需要后端 API 服务支持，默认连接 `http://localhost:8000`：

- `GET /stock/daily/{code}` - 查询指定日期的股票信息
- `GET /stock/monthly/{code}` - 查询最近一个月的股票信息
- `GET /stock/realtime/{code}` - 查询实时分钟数据

## 使用说明

### 日线数据查询
1. 输入6位股票代码（如：000001）
2. 可选择查询日期，不填则查询今天的数据
3. 点击"查询"按钮获取数据

### 月度数据查询
1. 输入6位股票代码
2. 点击"查询月度数据"按钮
3. 查看最近一个月的每日数据记录

### 实时分钟数据
1. 输入6位股票代码
2. 点击"查询实时数据"按钮
3. 可选择开启自动刷新，每分钟自动更新数据

## 注意事项

- 实时分钟数据仅在交易时间内可用（9:30-11:30, 13:00-15:00）
- 请确保后端服务正常运行在 8000 端口
- 股票代码格式为6位数字，如 000001（平安银行）

## 开发说明

### 添加新组件
1. 在 `components/` 目录下创建新的组件文件
2. 使用 TypeScript 定义接口和类型
3. 遵循 Shadcn UI 的设计规范

### 样式定制
- 主要样式使用 Tailwind CSS 类名
- 自定义样式可在 `app/globals.css` 中添加
- 组件样式遵循 Shadcn UI 的设计系统

### 状态管理
- 使用 React Hooks 管理组件状态
- 复杂状态可考虑使用 Context API 或状态管理库

## 部署

项目可以部署到任何支持 Next.js 的平台：

- Vercel (推荐)
- Netlify
- 自托管服务器

## 许可证

MIT License
