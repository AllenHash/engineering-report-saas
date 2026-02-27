# ERS工程可行性报告AI生成系统

## 项目概述
这是一个工程可行性报告AI生成SaaS系统，帮助工程咨询工程师自动生成符合中国规范的工程可行性研究报告。

## 技术栈
- 前端: Next.js 14 + Tailwind CSS + TypeScript
- 后端: Next.js API Routes
- AI: 硅基流动 (DeepSeek/GLM)
- 认证: JWT + 手机验证码

## 核心功能
1. 用户系统（手机号注册/登录）
2. 对话式报告创建
3. AI目录生成（层级化中心思想）
4. Agent内容生成
5. 逐章节编辑
6. 关键信息联动
7. 积分系统

## 开发任务
查看 DEV_TASKS.md 了解当前开发任务

## 项目路径
`~/openclaw/workspace/engineering-report-saas`

## 启动命令
```bash
cd ~/openclaw/workspace/engineering-report-saas
npm run dev
```

## 访问
- 本地: http://localhost:3000

## 重要文件
- PRD.md - 产品需求文档
- DEV_TASKS.md - 开发任务清单
- src/lib/agents/ - AI Agent模块
- src/app/api/ - 后端API
