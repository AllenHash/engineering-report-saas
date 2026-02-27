#!/bin/bash
# ERS 开发启动脚本
# 用法: ./dev.sh [任务描述]
# 不带参数时进入交互模式

cd ~/.openclaw/workspace/engineering-report-saas

echo "📂 当前项目: $(pwd)"
echo "📋 任务列表: prd/TODO.md"
echo "🎨 设计规范: prd/FRONTEND-GUIDE.md"
echo ""

if [ -n "$1" ]; then
    # 直接执行任务
    echo "🚀 开始开发: $1"
    claude -p --dangerously-skip-permissions "Read prd/README.md, prd/TODO.md, and prd/FRONTEND-GUIDE.md first. Then implement: $1. IMPORTANT: Follow the frontend design guidelines in FRONTEND-GUIDE.md to avoid 'AI味道'. Output the complete code files that need to be created or modified."
else
    # 交互模式
    echo "请输入开发任务描述:"
    read -r task
    if [ -n "$task" ]; then
        echo "🚀 开始开发: $task"
        claude -p --dangerously-skip-permissions "Read prd/README.md, prd/TODO.md, and prd/FRONTEND-GUIDE.md first. Then implement: $task. IMPORTANT: Follow the frontend design guidelines in FRONTEND-GUIDE.md to avoid 'AI味道'. Output the complete code files that need to be created or modified."
    fi
fi
