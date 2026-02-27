# 大模型配置指南

## 当前配置

### 1. 默认配置
- **API提供商**: SiliconFlow
- **模型**: DeepSeek-V3
- **位置**: `src/lib/api-utils.ts`
- **API Key**: `SILICONFLOW_API_KEY` 环境变量

### 2. 支持的多模型
项目设计支持多种国产大模型：
1. **智谱GLM** (GLM-4-Flash, GLM-4-Plus)
2. **阿里通义千问** (Qwen-Max, Qwen-Turbo)
3. **MiniMax** (ABAB5.5-Chat, Coding Plan)
4. **DeepSeek** (DeepSeek-V3, DeepSeek-R1)
5. **腾讯混元** (如有)

## 新增模型配置步骤

### 步骤1：添加环境变量
在 `.env.local` 中添加：
```bash
# 阿里通义千问示例
ALIBABA_API_KEY=your-api-key-here
ALIBABA_API_SECRET=your-api-secret-here
ALIBABA_QWEN_MODEL=qwen-max

# 智谱GLM示例
ZHIPU_API_KEY=your-api-key-here
ZHIPU_MODEL=glm-4-flash

# MiniMax示例 (Coding Plan)
MINIMAX_CODING_KEY=your-coding-api-key-here
MINIMAX_GENERAL_KEY=your-general-api-key-here
```

### 步骤2：创建模型配置类
在 `src/lib/models/` 目录下创建配置：
```typescript
// src/lib/models/alibaba.ts
export const AlibabaConfig = {
  apiKey: process.env.ALIBABA_API_KEY,
  apiSecret: process.env.ALIBABA_API_SECRET,
  endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  models: {
    'qwen-max': { name: 'Qwen Max', maxTokens: 8192 },
    'qwen-turbo': { name: 'Qwen Turbo', maxTokens: 4096 }
  }
};
```

### 步骤3：创建模型调用器
```typescript
// src/lib/models/AlibabaProvider.ts
export class AlibabaProvider {
  async call(prompt: string, model: string = 'qwen-max'): Promise<string> {
    // 实现阿里面向的API调用
  }
}
```

### 步骤4：集成到Agent系统
修改 `src/lib/agents/index.ts` 中的 `callAI` 函数：
```typescript
async function callAI(prompt: string, agentType: string): Promise<string> {
  // 根据配置选择模型提供商
  const provider = process.env.AI_PROVIDER || 'siliconflow';
  
  switch(provider) {
    case 'alibaba':
      return await alibabaProvider.call(prompt, 'qwen-max');
    case 'zhipu':
      return await zhipuProvider.call(prompt, 'glm-4-flash');
    case 'minimax':
      return await minimaxProvider.call(prompt, 'abab5.5-chat');
    default:
      return await siliconflowProvider.call(prompt, 'deepseek-ai/DeepSeek-V3');
  }
}
```

### 步骤5：添加模型选择界面
在聊天界面中添加模型选择器：
```typescript
// 模型选择下拉框
<select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
  <option value="deepseek-v3">DeepSeek V3</option>
  <option value="qwen-max">阿里通义千问 Max</option>
  <option value="glm-4-flash">智谱GLM-4 Flash</option>
  <option value="abab5.5-chat">MiniMax ABAB5.5-Chat</option>
</select>
```

## 针对不同场景的模型选择

### 1. 代码生成 (Coding)
- **首选**: MiniMax Coding Plan (abab5.5-chat)
- **备选**: 阿里通义千问代码版
- **场景**: 项目开发、代码优化、算法实现

### 2. 报告生成 (Report)
- **首选**: 智谱GLM-4 Plus
- **备选**: 阿里通义千问 Max
- **场景**: 工程报告、文档撰写、专业内容

### 3. 对话理解 (Conversation)
- **首选**: DeepSeek-V3
- **备选**: 阿里通义千问 Turbo
- **场景**: 意图分析、用户交互、任务理解

### 4. 验证检查 (Evaluation)
- **首选**: DeepSeek-R1
- **备选**: 高推理能力模型
- **场景**: 内容验证、质量检查、逻辑审核

## 模型性能参数

| 模型 | 上下文 | 速度 | 价格 | 代码能力 | 文本能力 |
|------|--------|------|------|----------|----------|
| DeepSeek-V3 | 128K | 快 | 低 | 优秀 | 优秀 |
| Qwen-Max | 128K | 中 | 中 | 优秀 | 优秀 |
| GLM-4-Flash | 128K | 快 | 低 | 良好 | 优秀 |
| ABAB5.5-Chat | 128K | 中 | 中 | 卓越 | 良好 |

## 配置验证

### 1. 测试连接
```bash
# 测试阿里API
curl -X POST "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" \
  -H "Authorization: Bearer $ALIBABA_API_KEY" \
  -d '{"model":"qwen-max","messages":[{"role":"user","content":"Hello"}]}'

# 测试智谱API
curl -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
  -H "Authorization: Bearer $ZHIPU_API_KEY" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"Hello"}]}'
```

### 2. 验证Agent系统
1. 启动开发服务器
2. 发送测试消息
3. 检查Agent日志
4. 验证API调用成功率

### 3. 性能基准测试
1. 响应时间测试
2. Token使用效率
3. 生成质量评估
4. 成本对比分析

## 故障排除

### 常见问题1：API认证失败
```
错误：Invalid API Key
解决：
1. 检查API Key是否正确
2. 验证是否有权限使用该模型
3. 检查网络连接和代理设置
```

### 常见问题2：模型不可用
```
错误：Model not available
解决：
1. 检查模型名称拼写
2. 验证账户是否支持该模型
3. 检查区域和服务状态
```

### 常见问题3：请求超时
```
错误：Request timeout
解决：
1. 检查网络延迟
2. 调整超时设置
3. 考虑使用更低延迟的模型
```

### 常见问题4：额度不足
```
错误：Insufficient quota
解决：
1. 检查账户余额
2. 切换成本更低的模型
3. 优化提示词减少Token使用
```

## 最佳实践

### 1. 模型轮询策略
```typescript
// 根据任务类型自动选择最佳模型
function getBestModel(taskType: TaskType): string {
  switch(taskType) {
    case 'code_generation': return 'abab5.5-chat';
    case 'report_generation': return 'glm-4-plus';
    case 'intent_analysis': return 'deepseek-v3';
    default: return process.env.DEFAULT_MODEL;
  }
}
```

### 2. 成本优化
- 简单任务使用低成本模型
- 批量处理减少调用次数
- 缓存结果减少重复生成

### 3. 质量保证
- 重要内容使用高可靠性模型
- 添加内容验证步骤
- 提供人工审核接口

## 后续优化

### 1. 智能路由
实现基于任务复杂度、成本、响应时间的智能模型路由。

### 2. 性能监控
添加模型性能监控，收集响应时间、成功率、成本数据。

### 3. A/B测试
对不同模型进行A/B测试，优化模型选择策略。

### 4. 用户反馈
收集用户对不同模型生成内容的反馈，持续优化。

---

*更新日期：2026-02-26*  
*责任人：阿飞*