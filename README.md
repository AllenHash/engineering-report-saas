# Engineering Report SaaS

> AI-powered engineering feasibility report generator for consultation engineers.

## 产品愿景

通过对话式交互 + 资料上传，帮助工程咨询工程师自动生成各类工程可行性报告（道路、水利、电力、污水、生态修复等）。

## 核心功能

- 🤖 对话式报告生成
- 📁 资料上传（文本、图片、Excel）
- 📋 内置多类型工程模板库
- 💎 积分制商业模式
- 🧩 模板市场（用户上传/交易）

## 技术栈

- **后端**: Python (FastAPI/Flask)
- **AI**: GLM / MiniMax / Qwen / DeepSeek（国产大模型）
- **前端**: 待定（Vue/React 或 no-code）
- **数据库**: PostgreSQL / MySQL
- **部署**: Docker

## 开发阶段

### Phase 1: 基础框架搭建
- [ ] 用户系统（注册/登录/积分账户）
- [ ] 简单对话界面
- [ ] 最小模板库（1-2类工程）

### Phase 2: 核心功能实现
- [ ] 资料上传功能
- [ ] 模板选择与加载
- [ ] 报告生成与预览
- [ ] 积分消耗/获取逻辑

### Phase 3: 扩展与优化
- [ ] 更多工程类型模板
- [ ] 模板市场
- [ ] 导出 PDF/Word
- [ ] 多人协作（后期）

## 快速开始

```bash
# 克隆项目
git clone https://github.com/your-username/engineering-report-saas.git
cd engineering-report-saas

# 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 运行
python src/main.py
```

## 许可证

MIT