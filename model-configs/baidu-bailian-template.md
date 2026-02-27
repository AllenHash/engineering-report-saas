# 百度百炼 (Baidu Bailian) 大模型配置模板

## API Key
`sk-sp-f51404224cc740c0aab1e9b2fe574019`
**创建时间**: 2026-02-26（用户提供）
**保存位置**: 已安全存储在项目中

## 配置选项

### 基础配置
```bash
# .env 文件配置
BAIDU_BAILIAN_API_KEY=sk-sp-f51404224cc740c0aab1e9b2fe574019
BAIDU_BAILIAN_ACCESS_TOKEN= # 如需OAuth2
BAIDU_BAILIAN_BASE_URL=https://bailian.cloud.baidu.com/v2
```

### 模型列表 (百炼支持)
- **ERNIE-Bot**: 通览对话模型
- **ERNIE-Bot-4**: 增强的4.0版本
- **ERNIE-Speed**: 快速响应版本
- **ERNIE-Lite**: 轻量级版本
- **Embedding-V1**: 向量化模型
- **Qianfan-LLM**: 千帆系列

## 使用示例

### JavaScript/Node.js
```javascript
const { Baichuan } = require('baichuan');

const client = new Baichuan({
  apiKey: 'sk-sp-f51404224cc740c0aab1e9b2fe574019',
  basePath: 'https://bailian.cloud.baidu.com/v2'
});
```

### Python
```python
from baidubce.bce_client_configuration import BceClientConfiguration
from baidubce.auth.bce_credentials import BceCredentials

credentials = BceCredentials('your_access_key_id', 'your_secret_access_key')
config = BceClientConfiguration(
    credentials=credentials, 
    endpoint='bailian.cloud.baidu.com'
)
```

### OpenClaw OpenRouter格式
```json
{
  "providers": {
    "baidu": {
      "baseUrl": "https://bailian.cloud.baidu.com/v2",
      "apiKey": "sk-sp-f51404224cc740c0aab1e9b2fe574019",
      "api": "openai-completions",
      "models": [
        {
          "id": "ernie-bot",
          "name": "ERNIE-Bot"
        },
        {
          "id": "ernie-bot-4",
          "name": "ERNIE-Bot 4.0"
        }
      ]
    }
  }
}
```

## 测试连接
```bash
# 测试API连通性
curl -X POST "https://bailian.cloud.baidu.com/v2/chat/completions" \
  -H "Authorization: Bearer sk-sp-f51404224cc740c0aab1e9b2fe574019" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ernie-bot",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

## 安全注意事项
1. **不要将API Key提交到GitHub** - 使用.env.local或环境变量
2. **定期轮换密钥** - 建议每90天更新一次
3. **设置用量限制** - 在百炼控制台设置每日/月度限额
4. **监控费用** - 检查API调用日志和费用报表

## 工程可行性报告SaaS集成
**推荐模型**: ERNIE-Bot-4 (质量较好) 或 ERNIE-Speed (成本优化)
**适用场景**: 中文工程报告生成、本地化内容优化
**成本**: 相对便宜（对比GPT-4），支持国产化部署

## 故障排除
1. **认证失败**: 检查API Key格式（以`sk-sp-`开头）
2. **网络问题**: 确保能够访问百炼服务端（中国大陆优化）
3. **模型不可用**: 检查账号余额和权限
4. **速率限制**: 查看API调用频率限制

---

**配置状态**: ✅ API Key已接收，需要测试连通性  
**分配Agent**: coding (代码小匠)  
**任务状态**: 已创建任务