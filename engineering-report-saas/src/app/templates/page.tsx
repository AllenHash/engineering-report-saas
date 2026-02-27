"use client";

import { useState } from "react";
import Link from "next/link";

// 模拟模板数据 - 后续从API获取
const TEMPLATES = [
  {
    id: "gov-2023-standard",
    name: "政府投资项目可行性研究报告编写通用大纲（2023年版）",
    industry: "general",
    industryName: "通用",
    description: "国家发改委2023年版政府投资项目通用大纲，适合各类政府投资项目",
    sectionsCount: 11,
    isSystem: true,
    isPublic: true,
  },
  {
    id: "highway-2023",
    name: "公路工程可行性研究报告大纲",
    industry: "highway",
    industryName: "公路工程",
    description: "适用于新建、改扩建公路工程项目",
    sectionsCount: 11,
    isSystem: true,
    isPublic: true,
  },
  {
    id: "municipal-2023",
    name: "市政工程可行性研究报告大纲",
    industry: "municipal",
    industryName: "市政工程",
    description: "适用于城市道路、桥梁、管网等市政基础设施项目",
    sectionsCount: 10,
    isSystem: true,
    isPublic: true,
  },
  {
    id: "ecology-2023",
    name: "生态环境工程可行性研究报告大纲",
    industry: "ecology",
    industryName: "生态环境",
    description: "适用于生态修复、环境治理等工程项目",
    sectionsCount: 9,
    isSystem: true,
    isPublic: true,
  },
  {
    id: "water-2023",
    name: "水利工程可行性研究报告大纲",
    industry: "water",
    industryName: "水利工程",
    description: "适用于水库、河道整治、灌溉等水利工程项目",
    sectionsCount: 10,
    isSystem: true,
    isPublic: true,
  },
  {
    id: "building-2023",
    name: "建筑工程可行性研究报告大纲",
    industry: "building",
    industryName: "建筑工程",
    description: "适用于各类建筑工程项目",
    sectionsCount: 8,
    isSystem: true,
    isPublic: true,
  },
];

const INDUSTRIES = [
  { id: "all", name: "全部", icon: "📋" },
  { id: "highway", name: "公路工程", icon: "🛣️" },
  { id: "municipal", name: "市政工程", icon: "🏙️" },
  { id: "ecology", name: "生态环境", icon: "🌿" },
  { id: "water", name: "水利工程", icon: "💧" },
  { id: "building", name: "建筑工程", icon: "🏗️" },
  { id: "general", name: "通用", icon: "📄" },
];

export default function TemplatesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchIndustry = selectedIndustry === "all" || template.industry === selectedIndustry;
    const matchSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchIndustry && matchSearch;
  });

  const getIndustryIcon = (industry: string) => {
    const found = INDUSTRIES.find(i => i.id === industry);
    return found?.icon || "📋";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 顶部导航 */}
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl">📋</Link>
            <span className="font-semibold">工程报告AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-white">首页</Link>
            <Link href="/templates" className="text-sm text-white">模板库</Link>
            <Link href="/reports" className="text-sm text-gray-400 hover:text-white">历史报告</Link>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">
              用
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">模板库</h1>
          <p className="text-gray-400">选择适合您项目的报告模板</p>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 行业筛选 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {INDUSTRIES.map((industry) => (
            <button
              key={industry.id}
              onClick={() => setSelectedIndustry(industry.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedIndustry === industry.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              <span>{industry.icon}</span>
              <span>{industry.name}</span>
            </button>
          ))}
        </div>

        {/* 模板列表 */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-400">未找到匹配的模板</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getIndustryIcon(template.industry)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      {template.isSystem && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                          系统
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📑 {template.sectionsCount} 章</span>
                      <span>📂 {template.industryName}</span>
                    </div>
                  </div>
                  <Link
                    href={`/?template=${template.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                  >
                    使用
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}