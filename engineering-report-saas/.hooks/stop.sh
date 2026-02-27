#!/bin/bash
# Claude Code Stop Hook
# 当 Claude Code 停止时触发

SESSION_ID=$1
CWD=$2
EXIT_CODE=$3

# 输出文件
OUTPUT_FILE="$CWD/.hooks/stop.json"

# 获取Claude Code的输出
CLAUDE_OUTPUT=$(cat)

# 写入结果文件
cat > "$OUTPUT_FILE" << EOF
{
  "session_id": "$SESSION_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S+08:00)",
  "cwd": "$CWD",
  "event": "Stop",
  "exit_code": $EXIT_CODE,
  "output": $(echo "$CLAUDE_OUTPUT" | jq -Rs .)
}
EOF

echo "Claude Code停止，状态已写入 $OUTPUT_FILE"
