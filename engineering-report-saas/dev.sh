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
你是一个专业的前端开发者。请严格遵循以下设计规范：

## 🚫 禁止使用的设计元素
- 禁止使用 Inter/Roboto/Arial 等系统默认字体
- 禁止白色背景 + 紫色渐变
- 禁止完全对称的网格布局  
- 禁止过多 emoji
- 禁止蓝色按钮 + 灰色背景的标准组合

## ✅ 推荐的设计方向
1. 字体：使用有特色的展示字体 + 正文字体搭配
2. 色彩：主色调 + 锐利强调色，避免均匀调色板
3. 布局：尝试不对称布局、元素重叠
4. 背景：使用渐变网格、噪点纹理、几何图案
5. 动效：页面加载动画、按钮悬停效果
6. 图标：使用 Lucide/Iconify，禁止 emoji

## 任务
$1

请输出完整的代码文件。"
else
    echo "用法: ./dev.sh \"任务描述\""
fi
