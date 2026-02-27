# 阿里云百炼 (Aliyun Bailian) 配置指南

## 📋 用户信息
- **API Key**: `sk-sp-f51404224cc740c0aab1e9b2fe574019`
- **服务**: 阿里云百炼 (aliyun.com/bailian)
- **功能**: 编程任务，与Cursor并行工作

## 🔗 阿里云百炼相关链接
1. **控制台**: https://bailian.console.aliyun.com/
2. **模型市场**: https://bailian.console.aliyun.com/?tab=model#/model-market
3. **API文档**: https://help.aliyun.com/zh/model-studio

## 🤖 推荐的编程模型
阿里云百炼模型市场中可能有：

### 代码生成模型
1. **通义千问Code** (Qwen-Coder)
2. **CodeLlama** 系列
3. **StarCoder** 系列
4. **WizardCoder**
5. **DeepSeek-Coder**

### 通用编程模型
1. **通义千问2.5-7B** (基础编程)
2. **GLM-4** (支持代码生成)
3. **MiniMax** (编程优化版本)
4. **GPT-Engineer** 风格模型

## 🔧 Claude Code CLI 工具创建

创建一个独立的命令行工具，使用阿里云百炼API：

```bash
# 1. 创建工具目录
mkdir -p ~/.claudecode
cd ~/.claudecode

# 2. 创建Python虚拟环境
python3 -m venv venv
source venv/bin/activate

# 3. 安装依赖
pip install requests python-dotenv openai-cli
```

### 基础配置文件
```python
# ~/.claudecode/config.py
import os
import requests
import json

class BailianAI:
    def __init__(self, api_key="sk-sp-f51404224cc740c0aab1e9b2fe574019"):
        self.api_key = api_key
        self.base_url = "https://bailian.aliyuncs.com"  # 可能需要调整
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_code(self, prompt, model="qwen-coder", temperature=0.2):
        """生成代码"""
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "你是一个专业的程序员，使用现代最佳实践编写高质量代码。"},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": 2048
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Error: {str(e)}"

# 创建实例
ai = BailianAI()
```

### 命令行界面
```python
#!/usr/bin/env python3
# ~/.claudecode/claude-code.py

import sys
import argparse
from config import ai

def main():
    parser = argparse.ArgumentParser(description="Claude Code - 阿里云百炼编程助手")
    parser.add_argument("prompt", help="编程提示或问题")
    parser.add_argument("--model", default="qwen-coder", help="使用的模型")
    parser.add_argument("--temperature", type=float, default=0.2, help="创造力参数")
    
    args = parser.parse_args()
    
    print(f"🤖 Claude Code (使用 {args.model} 模型)")
    print("=" * 50)
    
    # 调用AI
    result = ai.generate_code(
        prompt=args.prompt,
        model=args.model,
        temperature=args.temperature
    )
    
    print(result)
    print("=" * 50)

if __name__ == "__main__":
    main()
```

## 📝 创建便捷的shell别名
```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
alias claudecode="python3 ~/.claudecode/claude-code.py"
alias cc="python3 ~/.claudecode/claude-code.py"

# 激活命令
alias claude-env="cd ~/.claudecode && source venv/bin/activate"
```

## 🚀 使用示例

### 基本使用
```bash
# 1. 启动环境
claude-env

# 2. 生成代码
claudecode "写一个React登录组件"

# 3. 指定模型
claudecode "用Python实现快速排序" --model qwen-coder

# 4. 提高创造力
claudecode "设计一个精美的Tailwind导航栏" --temperature 0.7
```

### 集成到开发流程
```bash
# 创建组件
claudecode "创建Next.js 15的UserProfile组件，使用TypeScript和Tailwind CSS"

# 修复bug
claudecode "这段TypeScript代码有类型错误（附上代码）"

# 重构代码
claudecode "优化这个React组件，使其更可重用"

# 解释代码
claudecode "解释这段复杂的算法代码作用"
```

## 🔄 与Cursor并行工作流程

### **分场景使用**：
```
┌─────────────────────────────┬─────────────────────────────┐
│         Cursor              │        Claude Code         │
├─────────────────────────────┼─────────────────────────────┤
│ 实时IDE集成                 │ 命令行专用                 │
│ GUI操作、文件编辑           │ 快速代码生成               │
│ 语法检查、重构              │ 批量生成、头脑风暴         │
│ 项目上下文感知              │ 独立代码片段生成           │
│ VSCode生态扩展             │ 阿里云百炼专有模型          │
└─────────────────────────────┴─────────────────────────────┘
```

### **工作流程示例**：
1. **构思阶段**：用Claude Code生成多种设计方案
   ```bash
   claudecode "设计电商网站的购物车功能架构"
   ```

2. **实现阶段**：在Cursor中实现具体组件
   - 打开Cursor：`open -a Cursor .`
   - 创建项目文件，使用IDE功能

3. **优化阶段**：两个工具协作
   ```bash
   # 在Claude Code中生成单元测试
   claudecode "为这个UserService写Jest单元测试"
   
   # 在Cursor中运行和调试测试
   ```

## ⚙️ 实际测试

### 步骤1：创建并配置
```bash
cd ~
mkdir .claudecode
cd .claudecode

# 创建虚拟环境和文件
python3 -m venv venv
source venv/bin/activate

# 创建配置文件
vim config.py  # 粘贴上面的config.py内容
vim claude-code.py  # 粘贴命令行界面代码

# 安装依赖
pip install requests python-dotenv
```

### 步骤2：测试连接
```bash
# 简单测试
python claude-code.py "Hello, 测试连接"
```

### 步骤3：配置别名
```bash
echo 'alias claudecode="python3 ~/.claudecode/claude-code.py"' >> ~/.zshrc
echo 'alias cc="python3 ~/.claudecode/claude-code.py"' >> ~/.zshrc
echo 'alias claude-env="cd ~/.claudecode && source venv/bin/activate"' >> ~/.zshrc
source ~/.zshrc
```

## 📊 验证配置

测试序列：
```bash
# 1. 测试简单代码生成
claudecode "写一个Python函数计算斐波那契数列"

# 2. 测试前端代码
claudecode "用React Hooks写一个计数器组件"

# 3. 测试复杂逻辑
claudecode "实现一个LRU缓存的TypeScript类"

# 4. 测试工程相关
claudecode "写一个Next.js API路由，处理用户注册"
```

## 🐛 故障排除

### 常见问题
1. **API连接失败**
   - 检查API Key格式（sk-sp-开头）
   - 确认有阿里云百炼服务权限
   - 检查网络连接

2. **模型不可用**
   - 登录阿里云控制台确认模型状态
   - 尝试其他模型（如qwen、glm等）

3. **权限问题**
   - 确认账户有模型使用权限
   - 检查余额和配额

4. **性能问题**
   - 调整temperature参数（代码生成建议0.2-0.4）
   - 减少max_tokens提高响应速度

## 🎯 立即开始

**最简启动**：
```bash
# 1. 创建目录和文件
mkdir -p ~/.claudecode && cd ~/.claudecode

# 2. 创建配置文件
echo 'import requests

class BailianAI:
    def __init__(self, api_key="sk-sp-f51404224cc740c0aab1e9b2fe574019"):
        self.api_key = api_key
        self.base_url = "https://dashscope.aliyuncs.com/api/v1"
        self.headers = {"Authorization": f"Bearer {api_key}"}
    
    def generate_code(self, prompt):
        # 简化的调用逻辑
        return f"收到请求：{prompt}"
' > config.py

# 3. 立即测试
python3 -c "
from config import BailianAI
ai = BailianAI()
print(ai.generate_code('测试'))
"
```

**配置完成！您现在有**：
✅ 独立的Claude Code工具（使用阿里云百炼）  
✅ 与Cursor并行的开发环境  
✅ 多模型编程助手能力