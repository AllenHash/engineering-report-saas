# 知识库系统 (Knowledge Base System)

## 概述
为阿飞和主人建立的个人知识库系统，用于收集、整理和检索有价值的文章、资料和见解。

## 目录结构
```
knowledge-base/
├── articles/          # 原始文章内容（Markdown格式）
│   ├── {YYYY}/
│   │   └── {YYYY-MM-DD}-{slug}.md
├── summaries/         # AI生成的摘要
│   └── {same structure as articles}
├── topics/            # 按主题分类
│   ├── saas/
│   ├── crypto/
│   ├── programming/
│   ├── business/
│   └── personal-growth/
├── temp/              # 临时处理文件
└── index.json         # 文章索引和元数据
```

## 文章格式规范
每篇文章包含以下元数据：

```yaml
---
title: "文章标题"
url: "https://example.com/article"
source: "来源（微信、知乎、公众号等）"
date_collected: "2026-02-25"
date_published: "2026-02-20"（文章发布日期）
authors: ["作者1", "作者2"]
tags: ["tag1", "tag2", "tag3"]
summary: "AI生成的摘要（约200字）"
key_points:
  - "要点1"
  - "要点2"
  - "要点3"
related_projects: ["engineering-report-saas", "crypto-tracker"]
importance: 1-5（重要性评分）
---
```

## 工作流程

### 1. 分享文章
主人通过以下方式分享：
- 直接发送链接：[文章] https://example.com
- 批量导入多个链接
- 文件上传（PDF/HTML）

### 2. 自动处理
阿飞会：
1. 抓取网页内容
2. 提取正文，过滤广告
3. 解析元数据（标题、作者、日期等）
4. 生成摘要和关键词
5. 分类到相关主题
6. 保存到对应目录

### 3. 检索和使用
- 按主题、标签、日期检索
- 为项目提供参考资料
- 定期回顾和学习

## 标签体系
```
# 大类别
saas           # SaaS商业模式
crypto         # 加密货币、区块链
programming    # 编程、技术
ai-ml          # 人工智能、机器学习
business       # 商业、创业
product        # 产品设计、用户体验
market         # 市场营销、增长
finance        # 财务、投资
engineering    # 工程咨询、行业知识
personal-growth # 个人成长、效率
```

## 自动化功能
- 定期更新摘要质量
- 关联相关文章形成知识图谱
- 为新项目推荐参考资料
- 去重和合并相似内容

## 数据统计
- 文章总数统计
- 各主题分布
- 阅读和引用频率
- 知识积累进度

## 维护指南
1. 定期检查目录结构
2. 更新索引文件
3. 清理临时文件
4. 备份重要内容

---

*系统由阿飞自主维护，持续优化中*