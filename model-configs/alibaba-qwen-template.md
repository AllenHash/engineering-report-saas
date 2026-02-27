# 阿里云通义千问大模型配置模板

## 获取API Key
1. 访问 [阿里云官网](https://www.aliyun.com/)
2. 开通"通义千问"服务
3. 创建API Key和Access Key Secret
4. 获取API Endpoint

## 环境变量配置

### OpenClaw全局配置 (~/.openclaw/.env)
```bash
# 阿里通义千问
ALIBABA_API_KEY=your-api-key-here
ALIBABA_API_SECRET=your-api-secret-here
ALIBABA_QWEN_ENDPOINT=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 项目专用配置 (engineering-report-saas/.env.local)
```bash
# 阿里通义千问配置
ALIBABA_QWEN_API_KEY=your-api-key-here
ALIBABA_QWEN_API_SECRET=your-api-secret-here
ALIBABA_QWEN_ENDPOINT=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIBABA_QWEN_MODEL=qwen-max  # 可选: qwen-max, qwen-turbo, qwen-plus
```

## OpenClaw Models配置 (~/.openclaw/openclaw.json)

在`models.providers`中添加：
```json
"alibaba": {
  "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "apiKey": "env:ALIBABA_API_KEY",
  "api": "openai-completions",
  "headers": {
    "X-DashScope-SSO-Token": "env:ALIBABA_API_SECRET"
  },
  "models": [
    {
      "id": "qwen-max",
      "name": "阿里通义千问 Max",
      "api": "openai-completions",
      "reasoning": true,
      "input": ["text"],
      "contextWindow": 128000,
      "maxTokens": 8192
    },
    {
      "id": "qwen-turbo",
      "name": "阿里通义千问 Turbo",
      "api": "openai-completions",
      "reasoning": false,
      "input": ["text"],
      "contextWindow": 32000,
      "maxTokens": 4096
    }
  ]
}
```

## 测试连接

```bash
# 测试OpenClaw配置
openclaw models set alibaba/qwen-max
openclaw models test

# 测试curl请求
curl -X POST "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" \
  -H "Authorization: Bearer $ALIBABA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-max",
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'
```

## 常见问题

1. **鉴权方式**：阿里云使用Bearer Token + API Key + Secret
2. **计费方式**：按Token计费，查看阿里云控制台配额
3. **区域选择**：根据业务选择合适的地域节点
4. **网络要求**：确保可以访问阿里云国际站或中国站

## 可用模型列表
- `qwen-max`：最强版本，128K上下文
- `qwen-plus`：均衡版本
- `qwen-turbo`：高性价比版本
- `qwen2.5-coder`：专业编程版本（如有）

## 注意事项
1. 阿里云API访问可能有地域限制
2. 计费模式请提前了解
3. 建议先使用测试额度验证连接
4. 关注官方文档更新：https://help.aliyun.com/zh/model-studio/developer-reference/tongyi-qianwen