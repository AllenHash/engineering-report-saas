# 大模型配置检查清单

## 配置前准备
- [ ] 确定具体大模型提供商（阿里、智谱、MiniMax、DeepSeek等）
- [ ] 明确用途（通用对话、代码生成、报告生成等）
- [ ] 注册对应平台账号
- [ ] 完成实名认证（如需）
- [ ] 购买API额度或订阅计划

## 环境变量配置
- [ ] 在`~/.openclaw/.env`中添加API Key
- [ ] 在`engineering-report-saas/.env.local`中添加项目专用配置
- [ ] 验证环境变量加载：`echo $MODEL_API_KEY`

## OpenClaw Models配置
- [ ] 在`~/.openclaw/openclaw.json`中添加或修改`models.providers`配置
- [ ] 配置正确的`baseUrl`、`apiKey`引用
- [ ] 添加支持的模型列表及参数
- [ ] 设置默认模型：`openclaw models set provider/model`

## API连通性测试
- [ ] 测试curl请求成功
- [ ] 测试OpenClaw模型连接：`openclaw models test`
- [ ] 验证简单对话功能
- [ ] 测试具体应用场景（代码生成、报告生成等）

## 项目集成
- [ ] 在engineering-report-saas中配置模型调用
- [ ] 验证Agent系统能正常使用新模型
- [ ] 测试报告生成质量
- [ ] 性能基准测试（响应时间、质量）

## 安全与监控
- [ ] 验证API Key权限最小化原则
- [ ] 设置使用量监控和告警
- [ ] 配置Key轮换策略（如需）
- [ ] 备份配置文件和Key

## 文档记录
- [ ] 更新项目README.md中的模型配置说明
- [ ] 记录API调用示例和最佳实践
- [ ] 创建故障排除指南
- [ ] 记录计费和使用情况监控方法

---

## 各平台特定检查项

### 阿里通义千问
- [ ] 获取API Key和Secret
- [ ] 选择合适的地域节点
- [ ] 配置SSO Token鉴权
- [ ] 验证多模态支持（如需）

### 智谱GLM
- [ ] 完成实名认证
- [ ] 选择合适模型版本（Flash/Plus/Air）
- [ ] 配置多模态参数（如需图像理解）
- [ ] 测试函数调用能力

### MiniMax
- [ ] 区分通用Key和Coding Plan Key
- [ ] 配置正确的API端点（chatcompletion_v2 vs chatcompletion_pro）
- [ ] 测试abab5.5-chat等专用模型
- [ ] 验证代码生成能力

### DeepSeek
- [ ] 获取API Key（可能需要申请）
- [ ] 配置高版本模型（DeepSeek-V3等）
- [ ] 验证长上下文支持（128K/1M）
- [ ] 测试代码生成和推理能力

---

## 应急计划
- [ ] 准备备用模型配置
- [ ] 有API降级方案（如主模型失败时切换）
- [ ] 监控API可用性和性能
- [ ] 定期测试恢复流程