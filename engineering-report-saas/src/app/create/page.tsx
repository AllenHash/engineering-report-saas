"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProjectInfo {
  name: string;
  location: string;
  type: string;
  scale: string;
  investment: string;
  description: string;
}

interface OutlineLevel {
  id: string;
  title: string;
  centerThought: string;
  children?: OutlineLevel[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const PROJECT_TYPES = [
  { id: "highway", name: "公路工程", icon: "🛣️" },
  { id: "municipal", name: "市政工程", icon: "🏙️" },
  { id: "environmental", name: "生态环境工程", icon: "🌿" },
  { id: "water", name: "水利工程", icon: "💧" },
  { id: "building", name: "建筑工程", icon: "🏗️" },
  { id: "railway", name: "铁路工程", icon: "🚄" },
];

const DEFAULT_OUTLINE: OutlineLevel[] = [
  { id: "1", title: "总论", centerThought: "报告概述、项目基本信息、结论与建议" },
  { id: "2", title: "项目背景与必要性", centerThought: "区域发展需求、项目建设的意义" },
  { id: "3", title: "建设条件与选址方案", centerThought: "地理位置、自然条件、选址比较" },
  { id: "4", title: "工程建设方案", centerThought: "技术方案、设计标准、工程规模" },
  { id: "5", title: "投资估算与资金筹措", centerThought: "总投资估算、资金来源" },
  { id: "6", title: "财务评价", centerThought: "盈利能力分析、财务生存能力" },
  { id: "7", title: "环境影响评价", centerThought: "环保措施、环境影响分析" },
  { id: "8", title: "社会评价", centerThought: "社会效益分析、公众意见" },
];

export default function CreatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: "",
    location: "",
    type: "",
    scale: "",
    investment: "",
    description: "",
  });
  const [outline, setOutline] = useState<OutlineLevel[]>(DEFAULT_OUTLINE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 重定向未登录用户
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          projectInfo,
          context: messages,
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOutline = (id: string, field: "title" | "centerThought", value: string) => {
    setOutline((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const generateReport = async () => {
    setIsLoading(true);
    
    // 根据项目类型映射到模板ID
    const templateIdMap: Record<string, string> = {
      highway: "gov-2023-standard",
      municipal: "gov-2023-standard",
      environmental: "gov-2023-standard",
      water: "gov-2023-standard",
      building: "gov-2023-standard",
      railway: "gov-2023-standard",
    };
    
    const templateId = templateIdMap[projectInfo.type] || "gov-2023-standard";
    
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectInfo,
          templateId,
          sections: outline.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            description: chapter.centerThought,
          })),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReportGenerated(true);
        router.push(`/reports?id=${data.reportId}`);
      } else {
        alert(data.error || "生成失败");
      }
    } catch (err) {
      console.error("Generate error:", err);
      alert("生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-bold">📋 工程报告AI</a>
            <span className="text-gray-400">/ 创建报告</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/reports" className="text-gray-400 hover:text-white">历史报告</a>
            <a href="/templates" className="text-gray-400 hover:text-white">模板库</a>
            <a href="/profile" className="text-gray-400 hover:text-white">个人中心</a>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-gray-800 bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "项目信息" },
              { num: 2, label: "AI对话" },
              { num: 3, label: "目录确认" },
              { num: 4, label: "生成报告" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s.num
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {s.num}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    step >= s.num ? "text-white" : "text-gray-500"
                  }`}
                >
                  {s.label}
                </span>
                {i < 3 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 mx-4 ${
                      step > s.num ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Project Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">填写项目基本信息</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                项目名称 *
              </label>
              <input
                type="text"
                value={projectInfo.name}
                onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="例如：成灌高速公路建设工程"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  工程类型 *
                </label>
                <select
                  value={projectInfo.type}
                  onChange={(e) => setProjectInfo({ ...projectInfo, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">请选择工程类型</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  项目地点
                </label>
                <input
                  type="text"
                  value={projectInfo.location}
                  onChange={(e) => setProjectInfo({ ...projectInfo, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="例如：四川省成都市"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  建设规模
                </label>
                <input
                  type="text"
                  value={projectInfo.scale}
                  onChange={(e) => setProjectInfo({ ...projectInfo, scale: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="例如：双向4车道，全长20公里"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  估算投资
                </label>
                <input
                  type="text"
                  value={projectInfo.investment}
                  onChange={(e) => setProjectInfo({ ...projectInfo, investment: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="例如：5亿元"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                项目描述
              </label>
              <textarea
                value={projectInfo.description}
                onChange={(e) => setProjectInfo({ ...projectInfo, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="描述项目的背景、目标、主要内容..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={nextStep}
                disabled={!projectInfo.name || !projectInfo.type}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步：AI对话收集 →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: AI Chat */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">AI对话补充信息</h2>
            
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-gray-300">
                项目：<span className="text-white font-medium">{projectInfo.name}</span>
                <span className="text-gray-500 ml-2">
                  ({PROJECT_TYPES.find((t) => t.id === projectInfo.type)?.name})
                </span>
              </p>
              {projectInfo.location && (
                <p className="text-gray-400 text-sm mt-1">📍 {projectInfo.location}</p>
              )}
            </div>

            {/* Messages */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>请补充更多项目信息，我会帮你推荐合适的模板</p>
                  <p className="text-sm mt-2">例如：项目的具体位置、周边环境、预期效益等</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-400 px-4 py-2 rounded-lg">
                    AI 思考中...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="补充项目信息..."
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
              >
                发送
              </button>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium"
              >
                ← 上一步
              </button>
              <button
                onClick={nextStep}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                下一步：确认目录 →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Outline Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">确认报告目录结构</h2>
            
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-white mb-2">项目：{projectInfo.name}</h3>
              <p className="text-gray-400 text-sm">
                请确认或修改报告的一级目录结构，您也可以调整每个章节的中心思想
              </p>
            </div>

            <div className="space-y-3">
              {outline.map((chapter, idx) => (
                <div
                  key={chapter.id}
                  className="bg-gray-800/50 rounded-lg border border-gray-700 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 font-mono text-sm w-6">{idx + 1}.</span>
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs text-gray-500">章节名称</label>
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => updateOutline(chapter.id, "title", e.target.value)}
                          className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">中心思想（章节核心观点）</label>
                        <input
                          type="text"
                          value={chapter.centerThought}
                          onChange={(e) => updateOutline(chapter.id, "centerThought", e.target.value)}
                          className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                          placeholder="描述本章的核心观点..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium"
              >
                ← 上一步
              </button>
              <button
                onClick={nextStep}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                下一步：生成报告 →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Generate */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">生成工程可行性研究报告</h2>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-medium text-white mb-4">报告基本信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">项目名称：</span>
                  <span className="text-white">{projectInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">工程类型：</span>
                  <span className="text-white">
                    {PROJECT_TYPES.find((t) => t.id === projectInfo.type)?.name}
                  </span>
                </div>
                {projectInfo.location && (
                  <div>
                    <span className="text-gray-500">项目地点：</span>
                    <span className="text-white">{projectInfo.location}</span>
                  </div>
                )}
                {projectInfo.investment && (
                  <div>
                    <span className="text-gray-500">估算投资：</span>
                    <span className="text-white">{projectInfo.investment}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <span className="text-gray-500">目录结构：</span>
                <span className="text-white">{outline.map((c) => c.title).join(" → ")}</span>
              </div>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 text-yellow-200 text-sm">
              ⚠️ 生成报告需要消耗积分，确认生成后将扣除相应积分
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium disabled:opacity-50"
              >
                ← 上一步
              </button>
              <button
                onClick={generateReport}
                disabled={isLoading}
                className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50"
              >
                {isLoading ? "生成中..." : "🚀 开始生成报告"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
