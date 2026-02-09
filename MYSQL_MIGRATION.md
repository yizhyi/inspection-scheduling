# MySQL 数据库迁移指南

## 迁移说明

已将数据库从 PostgreSQL 迁移到 MySQL，主要更改如下：

## 依赖包变更

### 移除
- `pg` (PostgreSQL 客户端)
- `@types/pg`

### 新增
- `mysql2` (MySQL 客户端，内置 TypeScript 类型)

## 数据库配置变更

### 旧配置 (PostgreSQL)
```
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
```

### 新配置 (MySQL)
```
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
```

## SQL 脚本变更

### 旧脚本
- 文件: `backend/src/models/schema.sql`
- 使用 PostgreSQL 语法和特性

### 新脚本
- 文件: `backend/src/models/schema-mysql.sql`
- 使用 MySQL 语法

### 主要语法差异

1. **UUID 生成**
   - PostgreSQL: `gen_random_uuid()`
   - MySQL: 应用层生成 (使用 uuid 包)

2. **自动更新时间戳**
   - PostgreSQL: 触发器
   - MySQL: `ON UPDATE CURRENT_TIMESTAMP`

3. **JSON 类型**
   - PostgreSQL: `JSONB`
   - MySQL: `JSON`

4. **查询参数占位符**
   - PostgreSQL: `$1, $2, $3`
   - MySQL: `?, ?, ?`

## 代码变更

### 所有控制器已更新
- `controllers/inspectors.ts`
- `controllers/factories.ts`
- `controllers/tasks.ts`
- `controllers/schedules.ts`
- `controllers/stats.ts`

### 主要变更点
1. `result.rows` → `result` (解构数组)
2. `$1, $2` → `?, ?` (参数占位符)
3. `INSERT ... RETURNING` → `INSERT + SELECT` (获取插入结果)

## 数据库初始化

### 步骤 1: 创建数据库
```sql
CREATE DATABASE inspection_scheduling;
```

### 步骤 2: 执行建表脚本
```bash
cd backend
mysql -u root -p inspection_scheduling < src/models/schema-mysql.sql
```

### 步骤 3: 验证表结构
```sql
USE inspection_scheduling;
SHOW TABLES;
DESC inspectors;
DESC factories;
```

## 启动应用

### 1. 配置环境变量
```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，配置 MySQL 连接信息
```

### 2. 安装依赖
```bash
cd backend
npm install
```

### 3. 启动后端服务
```bash
npm run dev
```

### 4. 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

## 注意事项

1. **数据迁移**: 如果已有 PostgreSQL 数据，需要手动导出并导入到 MySQL
2. **性能**: MySQL 和 PostgreSQL 性能略有差异，可能需要调整索引
3. **特性**: MySQL 5.7+ 支持 JSON 类型，确保版本符合要求
4. **连接池**: mysql2 连接池配置与 pg 不同，已在代码中调整

## 测试验证

### 验证数据库连接
```bash
curl http://localhost:3001/health
```

### 验证 API 接口
```bash
# 获取验货员列表
curl http://localhost:3001/api/inspectors

# 创建验货员
curl -X POST http://localhost:3001/api/inspectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "baseAddress": "上海市浦东新区",
    "baseLatitude": 31.2304,
    "baseLongitude": 121.4737,
    "contact": "13800000000"
  }'
```

## 回滚方案

如果需要回滚到 PostgreSQL：

1. 恢复依赖包
```bash
npm uninstall mysql2
npm install pg @types/pg
```

2. 恢复代码
   - 使用 Git 回滚到迁移前的提交
   - 或手动恢复 PostgreSQL 版本的文件

3. 执行 PostgreSQL 脚本
```bash
psql -U postgres -d inspection_scheduling < src/models/schema.sql
```

---

**迁移日期**: 2026-02-09
**迁移版本**: 1.0.0
**兼容性**: MySQL 5.7+ / MariaDB 10.2+
