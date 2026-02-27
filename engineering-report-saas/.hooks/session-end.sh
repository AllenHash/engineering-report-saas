#!/bin/bash
# Claude Code SessionEnd Hook
# 当 Claude Code 完成任务时触发

SESSION_ID=$1
CWD=$2
EXIT_CODE=$3

# 输出文件
OUTPUT_FILE="$CWD/.hooks/latest.json"
GATEWAY_URL="http://127.0.0.1:18789"
TOKEN="a44df1b6fea231124b0a6813e35926ee8262ab58b2e97144"

# 获取Claude Code的输出
CLAUDE_OUTPUT=$(cat)

# 写入结果文件
cat > "$OUTPUT_FILE" << EOF
{
  "session_id": "$SESSION_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S+08:00)",
  "cwd": "$CWD",
  "event": "SessionEnd",
  "exit_code": $EXIT_CODE,
  "output": $(echo "$CLAUDE_OUTPUT" | jq -Rs .)
}
EOF

echo "Claude Code任务完成，结果已写入 $OUTPUT_FILE"

# 发送Wake Event通知OpenClaw
curl -s -X POST "$GATEWAY_URL/api/cron/wake" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Claude Code任务完成($SESSION_ID)，请读取结果进行测试\", \"mode\": \"now\"}" \
  || true

echo "已发送Wake Event"
