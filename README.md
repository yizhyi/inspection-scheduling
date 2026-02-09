# 验货排班系统

一个用于管理验货任务自动分配和优化的 Web 应用系统。

## 功能特性

- 验货员管理：添加、编辑、删除验货员信息
- 工厂管理：添加、编辑、删除工厂信息
- 任务管理：创建和管理验货任务
- 智能排班：基于时间和距离自动生成最优排班方案
- 地图可视化：在地图上查看验货员路线和工厂位置
- 成本统计：分析排班方案的成本和工作负荷

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Ant Design
- Leaflet (地图可视化)

### 后端
- Node.js
- Express
- TypeScript
- PostgreSQL

## 快速开始

### 后端启动

```bash
cd backend

# 安装依赖
npm install

# 配置数据库
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息

# 创建数据库表
psql -U postgres -c "CREATE DATABASE inspection_scheduling"
psql -U postgres -d inspection_scheduling -f src/models/schema.sql

# 启动开发服务器
npm run dev
```

后端服务将在 http://localhost:3001 运行

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 http://localhost:3000 运行

## 使用说明

1. 添加验货员和工厂信息
2. 创建验货任务
3. 在排班管理页面配置排班参数
4. 点击"生成排班"自动生成排班方案
5. 查看排班结果和地图可视化
6. 确认排班方案

## 排班算法

系统采用贪心算法进行排班优化，考虑以下因素：
- 时间成本
- 交通成本
- 工作负荷均衡
- 任务截止日期
- 验货员可用时间

## API 接口

- `GET /api/inspectors` - 获取验货员列表
- `POST /api/inspectors` - 创建验货员
- `GET /api/factories` - 获取工厂列表
- `POST /api/factories` - 创建工厂
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `POST /api/schedules/generate` - 生成排班
- `GET /api/schedules/:id` - 获取排班详情
- `GET /api/stats/cost` - 获取成本统计

## 许可证

ISC
