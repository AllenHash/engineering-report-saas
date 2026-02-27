#!/bin/bash
# ERS开发任务分发脚本
# 用法: ./dispatch.sh "任务描述"

TASK="$1"
PROJECT_DIR="$HOME/openclaw/workspace/engineering-report-saas"
SESSION_ID="ers-$(date +%Y%m%d-%H%M%S)"
OUTPUT_FILE="$PROJECT_DIR/.hooks/latest.json"

if [ -z "$TASK" ]; then
    echo "用法: $0 \"任务描述\""
    exit 1
fi

echo "========== 分发任务到Claude Code =========="
echo "任务: $TASK"
echo "项目: $PROJECT_DIR"
echo "Session: $SESSION_ID"
echo "============================================"

cd "$PROJECT_DIR"

# 构建完整任务
FULL_TASK="$TASK

项目路径: $PROJECT_DIR
重要提醒:
1. 完成后运行 'npm run build' 确认无编译错误
2. 简要说明完成的内容"

# 发送任务到Claude Code
echo "$FULL_TASK" | claude -p --dangerously-skip-permissions 2>&1 | tee /tmp/claude-output.txt

EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "========== Claude Code 执行完成 =========="
echo "退出码: $EXIT_CODE"

# 保存输出到Hook文件
cat > "$OUTPUT_FILE" << EOF
{
  "session_id": "$SESSION_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S+08:00)",
  "cwd": "$PROJECT_DIR",
  "event": "SessionEnd",
  "exit_code": $EXIT_CODE,
  "output": $(cat /tmp/claude-output.txt | head -100 | jq -Rs .)
}
EOF

echo "结果已保存到: $OUTPUT_FILE"

# 验证构建
echo ""
echo "========== 验证构建 =========="
cd "$PROJECT_DIR"
npm run build 2>&1 | tail -20

exit $EXIT_CODE
