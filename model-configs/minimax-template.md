# MiniMax大模型配置模板

## 获取API Key
1. 访问 [MiniMax开放平台](https://platform.minimaxi.com/)
2. 注册账号并完成认证
3. 创建API Key
4. 注意区分：通用对话API vs Coding Plan API

## 已有配置检查

### 当前配置 (~/.openclaw/.env)
```bash
MINIMAX_CODING_KEY=sk-cp-3bgAQyB-ltbKyhWQDn-Uuf4eqc_8qYLsmNo09m2ia8vUIiCsQOzgLT3F4AtDwy6y-XelgmClGQN7mqQyVuF_wngevkc938t_10wRfi68nsD2n0XES009ls8
```

### 项目配置 (engineering-report-saas/.env.local)
```bash
MINIMAX_API_KEY=sk-cp-3bgAQyB-ltbKyhWQDn-Uuf4eqc_8qYLsmNo09m2ia8vUIiCsQOzgLT3F4AtDwy6y-XelgmClGQN7mqQyVuF_wngevkc938t_10wRfi68nsD2n0XES009ls8
```

## API端点说明

### 1. 通用对话API
```bash
MINIMAX_GENERAL_URL=https://api.minimax.chat/v1/text/chatcompletion_pro
MINIMAX_GENERAL_KEY=your-general-api-key
```

### 2. Coding Plan API（专门用于代码生成）
```bash
MINIMAX_CODING_URL=https://api.minimax.chat/v1/text/chatcompletion_v2
MINIMAX_CODING_KEY=your-coding-api-key
```

### 3. 不同模型对应不同的端点
- **abab5.5-chat**: Coding Plan专用
- **abab5.5-chat-pro**: 通用对话专业版
- **abab6-chat**: 最新版本

## OpenClaw Models配置 (~/.openclaw/openclaw.json)

在`models.providers`中添加或修改：
```json
"minimax": {
  "baseUrl": "https://api.minimax.chat/v1",
  "apiKey": "env:MINIMAX_CODING_KEY",
  "api": "openai-completions",
  "models": [
    {
      "id": "abab5.5-chat",
      "name": "MiniMax ABAB5.5 Chat (Coding)",
      "api": "openai-completions",
      "reasoning": true,
      "input": ["text"],
      "contextWindow": 128000,
      "maxTokens": 8192,
      "description": "Coding Plan专用模型，代码生成能力强"
    },
    {
      "id": "abab5.5-chat-pro",
      "name": "MiniMax ABAB5.5 Chat Pro",
      "api": "openai-completions",
      "reasoning": true,
      "input": ["text", "image"],
      "contextWindow": 128000,
      "maxTokens": 8192,
      "description": "通用专业版，支持多模态"
    },
    {
      "id": "abab6-chat",
      "name": "MiniMax ABAB6 Chat",
      "api": "openai-completions",
      "reasoning": true,
      "input": ["text"],
      "contextWindow": 256000,
      "maxTokens": 16384,
      "description": "最新版本，性能更强"
    }
  ]
}
```

## 测试连接

### 测试Coding Plan API
```bash
# 测试curl请求到Coding Plan端点
curl -X POST "https://api.minimax.chat/v1/text/chatcompletion_v2" \
  -H "Authorization: Bearer $MINIMAX_CODING_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "abab5.5-chat",
    "messages": [
      {"role": "user", "content": "写一个Python函数计算斐波那契数列"}
    ],
    "temperature": 0.7
  }'
```

### 测试OpenClaw配置
```bash
openclaw models set minimax/abab5.5-chat
openclaw models test
```

## MiniMax Coding Plan特色

### 专用代码生成能力
- **优化的代码补全**：针对多种编程语言优化
- **上下文理解**：理解项目结构和模式
- **调试建议**：提供代码调试和改进建议

### 适合场景
1. **SaaS项目开发**：快速生成业务逻辑代码
2. **算法实现**：数学计算、数据处理算法
3. **API开发**：RESTful API、GraphQL服务
4. **前端开发**：React、Vue组件生成

## 针对工程SaaS的优化配置

### 1. 系统提示词优化
```javascript
const codingSystemPrompt = `你是一个专业的工程咨询软件开发者，擅长：
1. 生成工程可行性报告相关代码
2. 设计报告模板和数据模型
3. 实现报告生成和导出功能
4. 集成AI模型进行内容生成

请用TypeScript/React/Python等技术栈进行开发。`;
```

### 2. 代码风格配置
```json
{
  "temperature": 0.2,
  "top_p": 0.9,
  "max_tokens": 4096,
  "presence_penalty": 0.1,
  "frequency_penalty": 0.1,
  "stop": ["```", "###", "---"]
}
```

### 3. 分步骤代码生成
对于复杂功能，建议：
1. 先设计数据模型
2. 再实现核心算法
3. 然后添加用户界面
4. 最后集成测试

## 注意事项

### 1. API Key安全
- Coding Plan Key和通用Key不同
- 不要将Key提交到Git仓库
- 使用环境变量管理

### 2. 额度管理
- 查看平台控制台使用情况
- Coding Plan可能有独立计费
- 设置使用限制告警

### 3. 模型更新
- 关注官方公告，模型会定期更新
- 新版模型可能改变API接口
- 测试后再切换生产环境

## 故障排除

### 常见问题
1. **403错误**：API Key无效或过期
2. **429错误**：请求频率超过限制
3. **500错误**：MiniMax服务端问题
4. **超时**：网络连接问题

### 调试方法
1. 检查API Key类型是否正确（Coding vs General）
2. 检查终结点URL是否正确
3. 检查网络连接和代理设置
4. 查看MiniMax控制台错误日志

## 资源链接
- [MiniMax官方文档](https://platform.minimaxi.com/document)
- [Coding Plan说明](https://platform.minimaxi.com/document/features/coding-plan)
- [API参考](https://platform.minimaxi.com/document/api-documentation)
- [定价页面](https://platform.minimaxi.com/pricing)