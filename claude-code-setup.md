# 🤖 Claude Code 开发环境配置指南

## ✅ 当前状态检查
- **Cursor.app** ✅ 已安装 (版本: 2.5.25)
- **CLI工具** ✅ `/usr/local/bin/cursor`
- **配置文件** ✅ `~/.cursor/` 存在
- **工程目录** ✅ `~/.cursor/projects/` 已存在

## 🎯 配置目标
为 `engineering-report-saas` 项目配置完整的 Claude Code 开发环境

## 🔧 配置步骤

### 1. 打开项目到 Cursor
```bash
# 方法A: CLI打开
cd ~/.openclaw/workspace/engineering-report-saas
cursor .

# 方法B: GUI打开
open -a Cursor ~/.openclaw/workspace/engineering-report-saas
```

### 2. 配置AI模型（如果需要）
Cursor 默认使用自己的模型服务，但也可以配置 Claude API：

#### 检查当前AI设置
1. 打开 Cursor → 设置 (`Cmd+,`)
2. 搜索 "AI" 或 "模型"
3. 可能需要登录账户或配置API

#### 添加 Claude API（可选）
```json
// ~/.cursor/settings.json (如果存在)
{
  "cursor.ai.provider": "claude",
  "cursor.ai.claude.apiKey": "您的Claude-API-KEY",
  "cursor.ai.model": "claude-3.5-sonnet"
}
```

### 3. 安装必要的扩展

**推荐扩展**：
- **ES7+ React/Redux snippets** - React开发
- **Tailwind CSS IntelliSense** - Tailwind支持
- **Prettier** - 代码格式化
- **ESLint** - 代码检查
- **GitLens** - Git集成
- **vscode-styled-components** - 样式组件

**安装命令**：
```bash
# 通过 Cursor CLI 或 GUI 安装
```

### 4. 项目特定配置
创建或检查 `engineering-report-saas/.vscode/` 目录：

```json
// engineering-report-saas/.vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.autoSave": "afterDelay",
  "editor.codeActionsOnSave": {
    "source.organizeImports": "always",
    "source.fixAll": "always"
  }
}
```

### 5. AI助手配置
**训练 Cursor 了解您的项目**：
1. 在项目中添加 `cursor-rules.md` 文件
2. 描述项目结构和技术栈
3. 定义编码规范

```markdown
# cursor-rules.md - engineering-report-saas

## 项目概述
- **名称**: 工程可行性报告SaaS系统
- **技术栈**: Next.js 15 + TypeScript + Tailwind CSS
- **AI集成**: 多Agent架构 (coding/market/research/finance)

## 代码规范
- 使用 TypeScript 严格模式
- Tailwind CSS 类名优先
- 函数组件 + Hooks
- 参考现有组件结构

## 目录结构
src/
├── app/          # Next.js App Router
├── lib/          # 工具函数和AI代理
├── components/   # 公共组件
└── types/        # TypeScript类型定义
```

### 6. Git集成配置
```bash
cd ~/.openclaw/workspace/engineering-report-saas
# 确保已连接远程仓库
git remote -v
# 如果未连接:
git remote add origin https://github.com/AllenHash/engineering-report-saas.git
```

### 7. 测试开发环境
```bash
# 1. 启动开发服务器测试
cd ~/.openclaw/workspace/engineering-report-saas
npm run dev

# 2. 测试AI辅助功能
# - 创建新组件
# - 修复现有问题
# - 重构代码
```

## 🔌 与其他工具集成

### 与 OpenClaw 集成
```bash
# 在 Cursor 终端中可以使用 OpenClaw CLI
openclaw status
openclaw sessions list
```

### 与 Agent Hub 集成
```bash
# 启动Agent面板
cd ~/.openclaw/skills/agent-hub
node server.js &
# 访问: http://localhost:3001/index.html
```

## 📊 验证配置

✅ **基础检查**：
- [ ] Cursor 能成功打开项目
- [ ] 代码高亮和补全正常工作
- [ ] AI 建议功能可用
- [ ] Git 集成正常

✅ **项目特定**：
- [ ] Next.js 开发服务器能启动
- [ ] TypeScript 类型检查正常
- [ ] Tailwind CSS 类名补全有效
- [ ] 代码格式化工作正常

✅ **开发流程**：
- [ ] 能创建新组件
- [ ] 能运行测试
- [ ] 能提交代码到Git

## 🚀 立即开始开发

### 入门任务
1. **修复现有问题**
   ```bash
   # 检查当前问题
   npm run lint
   npm run type-check
   ```

2. **增强AI代理功能**
   - 完善 `src/lib/agents/` 中的多Agent逻辑
   - 集成百炼大模型API
   - 优化任务分配机制

3. **开发新功能**
   - 用户认证系统
   - 积分管理系统
   - 报告生成器

### 常用命令
```bash
# 开发
npm run dev           # 启动开发服务器
npm run build         # 生产构建
npm run lint          # 代码检查
npm run type-check    # TypeScript检查

# Git操作
git add .
git commit -m "描述"
git push origin main

# OpenClaw集成
openclaw status
openclaw sessions send --message "更新任务"
```

## 🐛 故障排除

### 常见问题
1. **Cursor AI 不工作**
   - 检查网络连接
   - 确认账户登录状态
   - 尝试重启 Cursor

2. **TypeScript 错误**
   - 运行 `npm install` 更新依赖
   - 检查 `tsconfig.json` 配置

3. **Tailwind CSS 不生效**
   - 检查 `tailwind.config.ts` 配置
   - 确认类名是否正确

4. **Git 集成问题**
   - 确认已登录 GitHub
   - 检查远程仓库配置

### 获取帮助
- **Cursor 文档**: https://docs.cursor.com
- **GitHub 仓库**: https://github.com/AllenHash/engineering-report-saas
- **OpenClaw 面板**: http://localhost:3001/index.html

---

**配置状态**: ✅ Claude Code (Cursor) 开发环境已准备好用于 `engineering-report-saas` 项目开发
**下一步**: 使用 Cursor 开始开发 MVP 功能