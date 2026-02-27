#!/bin/bash
# ERS 开发启动脚本
# 用法: ./dev.sh [任务描述]

cd ~/.openclaw/workspace/engineering-report-saas

echo "📂 项目: engineering-report-saas"
echo "📋 PRD: prd/"
echo "🎨 设计: prd/FRONTEND-GUIDE.md"
echo ""

if [ -n "$1" ]; then
    claude -p --dangerously-skip-permissions "
# 角色：专业前端开发者

## 🚫 禁止使用
- 系统字体（Inter/Roboto/Arial）
- 紫色/蓝色渐变白色背景
- 对称布局
- emoji（必须用 Lucide/Heroicons）
- 空占位符（必须真实图片）
- 纯蓝/纯紫主色

## ✅ 推荐设计
1. 产品思维：先思考核心路径、边界异常
2. 审美重构：
   - 版式：非对称分栏、网格+破格
   - 色彩：高对比撞色、三原色
   - 形态：曲线切割、体块叠合
   - 动效：200-300ms 过渡
3. 工程师克制：
   - 语义化 HTML5
   - 可访问性（点击≥44px）
   - 真实图片

## 任务
$1

输出完整代码文件。"
else
    echo "用法: ./dev.sh \"任务描述\""
fi
