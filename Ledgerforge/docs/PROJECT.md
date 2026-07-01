# Ledgerforge 项目说明

## 基本信息

- 项目名称：Ledgerforge
- 当前版本：V1.3.2.2
- 产品名称：项目财务台账
- 当前形态：浏览器端单页 MVP
- 数据存储：浏览器 `localStorage`
- 后端服务：未实现
- 数据库：未实现
- API：未实现
- 鉴权与权限：未实现，代码中仅预留固定用户 `预留用户`

## 项目目标

Ledgerforge 用于将机械设备制造类业务中以 Excel 维护的项目财务台账迁移到一个可查询、可维护、可归集、可统计的轻量系统中。

当前版本重点验证以下核心流程：

- Excel 文件导入
- Excel 表头到系统字段的映射
- 项目台账维护
- 收付款与发票维护
- 项目统计归集
- 报表查询
- 字段配置
- 操作日志

## 当前技术形态

当前代码是一个无构建步骤的静态前端应用。

主要技术：

- HTML
- Tailwind CSS CDN
- 原生 JavaScript
- 自定义 CSS
- SheetJS CDN，用于浏览器端解析 Excel
- Lucide CDN，用于图标
- Node.js 静态文件服务脚本，仅用于本地预览

## 主要目录与文件

- `index.html`：应用入口页面，加载 Tailwind、Lucide、SheetJS 和本地脚本。
- `assets/app.js`：页面渲染、路由、交互、弹窗、导入流程和业务操作入口。
- `assets/data-store.js`：本地数据层，负责 localStorage 读写、数据迁移、统计计算、CRUD 和日志。
- `assets/seed-data.js`：初始化演示数据。
- `assets/styles.css`：样式补充。
- `dev-server.js`：本地静态文件服务器。
- `README.md`：当前项目说明。
- `CHANGELOG.md`：根目录版本记录。
- `docs/`：项目维护文档目录。

## 当前运行方式

代码中提供 `dev-server.js` 作为本地静态服务入口。

已确认：

- 应用可作为静态页面运行。
- 本地服务脚本默认端口为 `4173`。
- 页面通过 hash 路由切换，例如 `#dashboard`、`#import`、`#projects`。

未知：

- 是否存在正式部署环境。
- 是否存在 CI/CD。
- 是否存在生产域名。

## 当前数据边界

当前所有业务数据保存在浏览器本地：

- localStorage key：`project-finance-ledger-mvp-v1`
- 数据不会自动同步到服务器。
- 换浏览器、清理浏览器数据、切换设备后，数据不会自动保留。
- 多用户协作未实现。

## 已确认的业务对象

当前代码中已确认存在以下核心数据集合：

- 导入批次 `imports`
- Sheet 信息 `sheets`
- 字段映射 `mappings`
- 项目 `projects`
- 台账明细 `ledger`
- 收付款 `payments`
- 发票 `invoices`
- 统计归集 `groupings`
- 字段定义 `fieldDefs`
- 往来单位 `partners`
- 操作日志 `logs`

## 当前版本定位

V1.3.2.2 是一个本地 MVP 功能完善版本。代码和文档中可以确认该版本包含：

- Excel 导入向导去掉项目归属确认步骤。
- 导入预览页基于本次真实解析数据展示 Sheet、项目、台账明细、收付款、发票和问题。
- 导入修正页基于真实解析问题展示处理方式。
- 导入确认页基于真实解析数据确认写入内容。

是否已经发布到远程仓库：未知。

## 明确不属于当前版本的能力

当前代码未实现以下能力：

- 后端持久化
- 数据库
- API 服务
- 登录
- 用户权限
- 多用户协作
- 服务端审计
- 自动化测试
- 正式导出文件生成
- 正式报表引擎
