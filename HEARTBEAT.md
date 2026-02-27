# HEARTBEAT.md

## 每30分钟检查 ERS 项目状态

### 检查项目状态
1. 检查 http://localhost:3000 是否可访问
2. 如果项目停止 → 重新启动 `cd ~/openclaw/workspace/engineering-report-saas && npm run dev`
3. 检查是否有待完成任务（查看 DEV_TASKS.md）
4. 检查 Claude Code Hook 结果 (.hooks/latest.json)

### 决策规则
- 项目停止 → 自动启动
- 有Hook结果 → 读取并测试
- 有计划任务 → 按计划执行
- 无计划或需要决策 → 发消息通知主人

### Hook机制
Claude Code完成任务后会:
1. 写入 .hooks/latest.json
2. 发送Wake Event通知

读取Hook结果后:
1. 解析输出
2. 运行 npm run build 验证
3. 如需测试，启动浏览器验证
4. 将错误反馈给Claude Code修复

### 项目信息
- 项目路径: ~/openclaw/workspace/engineering-report-saas
- 健康检查: http://localhost:3000
- Hook结果: .hooks/latest.json
