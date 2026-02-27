# 🎯 Agent面板激活计划 - 从静态到真实API控制板

## 🔍 当前状态分析

### 🏗️ 现有基础设施
```
~/.openclaw/
├── skills/agent-hub/          # 静态面板 (index.html)
│   └── demo数据，需API集成
├── workspace-agents/          # 4个真实Agent工作区
│   ├── coding/
│   ├── market/
│   ├── research/
│   └── finance/
├── openclaw.json             # Agent配置 (已定义4个Agent)
└── coding-agent.json         # coding专用配置 (已存在)
```

### ✅ 可用API端点
1. **OpenClaw内置API**: 可通过 `sessions_list`, `sessions_send`, `sessions_spawn` 等工具控制
2. **Agent配置**: `openclaw.json` 中已有4个Agent定义
3. **4个真实工作区**: 已包含SOUL.md身份定义

## 💡 真实面板架构设计

### 三层架构
```
[Web UI 前端]       -- 可视化界面
    ↓ API
[OpenClaw接口层]    -- 调用OpenClaw工具
    ↓
[4个真实Agent]      -- 执行任务
```

### 核心功能模块
1. **Agent状态监控** - 实时显示4个Agent在线状态、工作负载
2. **任务队列管理** - 创建、分配、监控任务进度
3. **Token消耗统计** - 对接OpenClaw使用统计
4. **实时消息传递** - 通过API与Agent通信
5. **面板控制** - 启动/停止Agent、配置SOUL/MEMORY

## 🚀 实现步骤

### Phase 1: API层搭建 (1-2小时)
1. **创建API接口**
   - `/api/agents/list` - 获取4个Agent状态和工作区信息
   - `/api/agents/status` - 获取实时状态和Token消耗
   - `/api/agents/chat` - 与指定Agent对话
   - `/api/tasks/create` - 创建新任务并分配
   - `/api/tasks/queue` - 获取任务队列状态

2. **OpenClaw对接**
   - 实现 `sessions_list` 查询Agent状态
   - 实现 `sessions_send` 向Agent发送消息
   - 实现 `sessions_spawn` 创建任务会话
   - 实现 `subagents` 监控子Agent状态

### Phase 2: UI层改造 (1-2小时)
1. **替换静态数据为API调用**
   - Agent列表从静态数组改为 `/api/agents/list`
   - 任务队列从静态改为 `/api/tasks/queue`
   - Token消耗从静态改为 `/api/agents/status`

2. **增强交互功能**
   - 实时状态更新 (每30秒轮询)
   - 创建真实任务表单
   - Agent配置编辑接口
   - 任务执行进度跟踪

### Phase 3: 整合测试 (1小时)
1. **测试4个Agent激活**
   - 手动创建测试任务，分配给coding Agent
   - 验证market Agent响应
   - 测试research和finance协作

2. **工作流程验证**
   - 任务创建 → 分配 → 执行 → 完成闭环
   - Agent间消息传递
   - 面板状态同步

### Phase 4: 部署优化 (可选)
1. **权限控制** - 配置sessions_spawn白名单
2. **性能优化** - 减少API调用次数
3. **错误处理** - 增强容错机制
4. **日志记录** - 添加操作日志

## 🛠️ 技术细节

### API调用示例
```javascript
// 获取Agent状态
const response = await fetch('/api/agents/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getStatus' })
});
```

### 消息转发机制
```javascript
// 发送消息到coding Agent
const result = await sessions_send({
  agentId: 'coding',
  message: task.description,
  workspace: '/Users/allenhash/.openclaw/workspace-agents/coding/'
});
```

### 状态更新策略
```javascript
// 每30秒轮询状态
setInterval(async () => {
  const agents = await getAgentsStatus();
  updateUI(agents);
  updateTasks(agents);
}, 30000);
```

## 🎯 MVP功能目标

### 必须完成
1. ✅ 实时显示4个Agent状态 (空闲/工作中)
2. ✅ 创建并分配任务给指定Agent
3. ✅ 监控任务执行进度
4. ✅ 与Agent双向对话
5. ✅ Token消耗统计显示

### 第一阶段完成
1. ✅ 任务队列管理 (待处理/进行中/已完成)
2. ✅ Agent配置编辑 (SOUL.md修改)
3. ✅ 操作历史记录
4. ✅ 多Agent协作任务

## 📅 时间预估
- **Phase 1**: 1小时 - API层基础搭建
- **Phase 2**: 1小时 - UI改造和数据绑定
- **Phase 3**: 30分钟 - 基础功能完整测试
- **总时间**: 2.5小时完成真实面板V1

## 🔧 立即开始

**第一步**: 创建API服务器框架
**第二步**: 改造index.html为动态数据
**第三步**: 配置第一个真实任务流

---

**确认后立即开始！** 您希望按这个计划执行吗？