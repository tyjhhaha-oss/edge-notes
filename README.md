# Edge Notes 📝

> 一个基于 **Next.js** + **Cloudflare Pages** + **D1 Database** 构建的极简边缘笔记应用。
> 
> **在线演示**: [https://edge-notes-bdo.pages.dev](https://edge-notes-bdo.pages.dev)

## ✨ 项目亮点

- **边缘计算**: 依托 Cloudflare Edge Runtime，全球低延迟访问。
- **Server Actions**: 利用 Next.js 15 最新特性处理数据变更。
- **SQLite on Edge**: 使用 Cloudflare D1 分布式数据库存储数据。
- **极致轻量**: 零冷启动，秒级响应。

## 🚀 功能特性

### 1. 笔记管理 (CRUD)
- **创建**: 支持 Markdown 格式，可选择公开/私有。
- **列表**: 分页展示，支持按标题/内容搜索。
- **详情**: 渲染 Markdown 内容，日期格式化。
- **编辑/删除**: 仅限登录用户操作。

### 2. 权限控制 (Auth)
- **极简鉴权**: 基于 Cookie 的密码验证 (默认密码: `admin123`)。
- **公开访问**: 所有人可通过链接访问公开笔记，无需登录。
- **私有保护**: 私有笔记必须登录后才能查看。

### 3. 分享与体验
- **一键分享**: 详情页提供专属分享链接，自动复制。
- **友好交互**: 适配移动端，优雅的加载状态与错误处理。

## 🛠️ 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **部署**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **数据库**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **工具**: Wrangler CLI

## 💻 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/tyjhhaha-oss/edge-notes.git
   cd edge-notes
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境**
   复制 `wrangler.toml.example` (如果有) 或参考以下配置：
   ```toml
   name = "edge-notes"
   pages_build_output_dir = ".vercel/output/static"
   compatibility_flags = ["nodejs_compat"]
   ```

4. **初始化数据库 (Local)**
   本地开发默认使用 Mock 数据 (内存存储)，无需配置 D1 即可快速预览 UI。
   如需连接真实 D1，请使用 Wrangler。

5. **启动开发服务器**
   ```bash
   npm run dev
   ```
   访问 `http://localhost:3000`

## 📦 部署指南

本项目已配置为通过 Cloudflare Pages 自动部署。

1. Fork 本仓库。
2. 在 Cloudflare Dashboard 创建新 Pages 项目，连接你的 GitHub。
3. **构建配置**:
   - Framework preset: `Next.js (Static HTML Export)` (注意：实际使用的是 `@cloudflare/next-on-pages`)
   - Build command: `npx @cloudflare/next-on-pages`
   - Output directory: `.vercel/output/static`
4. **绑定 D1**:
   - 在 Pages 项目设置 -> Functions -> D1 Database Bindings 中，绑定变量名 `DB` 到你的 D1 数据库。
5. **环境变量**:
   - 设置 `ADMIN_PASSWORD` (可选，默认为 `admin123`)。

---
*Created for Technical Assessment*
