# 智谱GLM大模型配置模板

## 获取API Key
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册账号并实名认证
3. 创建API Key
4. 获取API Endpoint

## 环境变量配置

### OpenClaw全局配置 (~/.openclaw/.env)
```bash
# 智谱GLM
ZHIPU_API_KEY=your-api-key-here
```

### 项目专用配置 (engineering-report-saas/.env.local)
```bash
# 智谱GLM配置
ZHIPU_API_KEY=your-api-key-here
ZHIPU_MODEL=glm-4-flash  # 可选: glm-4-flash, glm-4-plus, glm-4-air
```

## OpenClaw Models配置 (~/.openclaw/openclaw.json)

在`models.providers`中添加：
```json
"zhipu": {
  "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
  "apiKey": "env:ZHIPU_API_KEY",
  "api": "openai-completions",
  "models": [
    {
      "id": "glm-4-flash",
      "name": "智谱GLM-4 Flash",
      "api": "openai-completions",
      "reasoning": false,
      "input": ["text", "image"],
      "contextWindow": 128000,
      "maxTokens": 4096
    },
    {
      "id": "glm-4-plus",
      "name": "智谱GLM-4 Plus",
      "api": "openai-completions",
      "reasoning": true,
      "input": ["text", "image"],
      "contextWindow": 128000,
      "maxTokens": 8192
    },
    {
      "id": "glm-4-air",
      "name": "智谱GLM-4 Air",
      "api": "openai-completions",
      "reasoning": false,
      "input": ["text"],
      "contextWindow": 32000,
      "maxTokens": 2048
    },
    {
      "id": "glm-4v-plus",
      "name": "智谱GLM-4V Plus",
      "api": "openai-completions",
      "reasoning": true,
      "input": ["text", "image"],
      "contextWindow": 128000,
      "maxTokens": 8192
    }
  ]
}
```

## 测试连接

```bash
# 测试OpenClaw配置
openclaw models set zhipu/glm-4-flash
openclaw models test

# 测试curl请求
curl -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
  -H "Authorization: Bearer $ZHIPU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4-flash",
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'
```

## 智谱GLM特色

### 代码能力
GLM-4系列在代码生成方面表现优秀，特别是：
- **glm-4-plus**：支持长代码生成和复杂逻辑
- **coding专用模型**：部分GLM变体专门优化代码生成

### 多模态支持
- **图像理解**：支持上传图片进行分析
- **文档处理**：可处理PDF、Word等文档

### 工具调用
支持Function Calling，可集成外部工具和函数调用

## 计费模式
1. **按Token计费**：输入+输出分别计费
2. **不同模型不同价格**：GLM-4 Flash最便宜，Plus最贵
3. **免费额度**：新用户通常有免费额度

## 最佳实践

### 1. 针对工程报告SaaS的优化
```javascript
// 使用GLM生成工程报告
const systemPrompt = `你是一个工程咨询专家，擅长生成可行性研究报告。
请按照以下结构生成报告：
1. 项目概况
2. 市场分析
3. 技术方案
4. 财务分析
5. 风险与建议`;

const userPrompt = `生成一个水库工程的可行性研究报告`;
```

### 2. 温度参数设置
- **代码生成**：temperature=0.2 (更确定性)
- **创意内容**：temperature=0.8 (更多样性)

### 3. 上下文长度管理
- 对于长报告，使用128K上下文的GLM-4 Plus
- 分章节生成，最后整合

## 注意事项
1. **实名认证**：智谱平台需要实名认证才能使用
2. **区域限制**：主要服务中国用户
3. **版本更新**：关注模型版本更新，性能会持续优化
4. **文档地址**：https://open.bigmodel.cn/dev/api

## 故障排除
1. **认证失败**：检查API Key是否正确，是否有权限
2. **超时错误**：检查网络连接，智谱服务器在国内
3. **额度不足**：检查账户余额和免费额度