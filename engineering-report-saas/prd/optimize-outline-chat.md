# 开发任务：优化目录确认对话体验

## 任务描述
优化 src/app/create/page.tsx 中的目录确认对话流程

## 当前问题
1. 一级目录确认时，用户说"确认"后直接跳到下一章，体验不够直观
2. 用户需要更清楚地知道当前在哪一步

## 修改要求
1. 在消息中显示章节确认进度（如：第 1/8 章）
2. 显示当前正在确认的章节详情
3. 用户可以说"下一章"、"上一章"来切换
4. 保持纯对话风格

## 项目信息
- 项目路径: ~/.openclaw/workspace/engineering-report-saas
- 技术栈: Next.js, TypeScript, React, Tailwind CSS
- 模型: MiniMax-M2.5
