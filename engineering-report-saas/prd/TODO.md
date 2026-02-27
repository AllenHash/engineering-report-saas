# 开发待办事项

## 🔴 高优先级
- [x] 积分系统完善
- [ ] PDF/Word 导出

## 🟡 中优先级
- [ ] 用户个人中心完善
- [ ] 报告历史列表优化

## 🟢 低优先级
- [ ] 模板收藏功能
- [ ] 模板搜索功能

---

## 📋 Claude Code 开发指令

在项目目录运行：

```bash
cd ~/.openclaw/workspace/engineering-report-saas

claude -p --dangerously-skip-permissions "Read prd/README.md and prd/TODO.md to understand current tasks. Then implement the highest priority feature. Output the code changes needed."
```

或者指定具体 PRD：

```bash
claude -p --dangerously-skip-permissions "Read prd/PRD-006-积分系统.md and implement the points system feature."
```
