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
  confirmed: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  action?: "input_name" | "input_type" | "input_location" | "input_details" | "confirm_outline" | "generating" | null;
}

// 工程类型选项
const PROJECT_TYPES = [
  { id: "highway", name: "公路工程", icon: "🛣️" },
  { id: "municipal", name: "市政工程", icon: "🏙️" },
  { id: "environmental", name: "生态环境工程", icon: "🌿" },
  { id: "water", name: "水利工程", icon: "💧" },
  { id: "building", name: "建筑工程", icon: "🏗️" },
  { id: "railway", name: "铁路工程", icon: "🚄" },
];

// 默认大纲
const DEFAULT_OUTLINE: OutlineLevel[] = [
  { id: "1", title: "总论", centerThought: "报告概述、项目基本信息、结论与建议", confirmed: false },
  { id: "2", title: "项目背景与必要性", centerThought: "区域发展需求、项目建设的意义", confirmed: false },
  { id: "3", title: "建设条件与选址方案", centerThought: "地理位置、自然条件、选址比较", confirmed: false },
  { id: "4", title: "工程建设方案", centerThought: "技术方案、设计标准、工程规模", confirmed: false },
  { id: "5", title: "投资估算与资金筹措", centerThought: "总投资估算、资金来源", confirmed: false },
  { id: "6", title: "财务评价", centerThought: "盈利能力分析、财务生存能力", confirmed: false },
  { id: "7", title: "环境影响评价", centerThought: "环保措施、环境影响分析", confirmed: false },
  { id: "8", title: "社会评价", centerThought: "社会效益分析、公众意见", confirmed: false },
];

export default function CreatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "你好！我是工程报告AI助手 📋\n\n请告诉我你想写什么类型的可行性报告？\n\n比如：\"我想写一个高速公路项目\" 或 \"帮我生成一个市政道路的可研报告\"",
      timestamp: new Date(),
      action: "input_name",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: "",
    location: "",
    type: "",
    scale: "",
    investment: "",
    description: "",
  });
  const [outline, setOutline] = useState<OutlineLevel[]>(DEFAULT_OUTLINE);
  const [currentPhase, setCurrentPhase] = useState<"name" | "type" | "details" | "outline" | "generating">("name");
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

  const addMessage = (role: "user" | "assistant" | "system", content: string, action: Message["action"] = null) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date(),
        action,
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    addMessage("user", userInput);
    setInput("");
    setIsLoading(true);

    try {
      // 根据当前阶段处理输入
      if (currentPhase === "name") {
        // 用户输入了项目名称
        setProjectInfo((prev) => ({ ...prev, name: userInput }));
        addMessage(
          "assistant",
          `好的，项目名称是"${userInput}"。\n\n请问这是什么类型的工程？\n\n${PROJECT_TYPES.map((t) => `${t.icon} ${t.name}`).join("  ")}`,
          "input_type"
        );
        setCurrentPhase("type");
      } else if (currentPhase === "type") {
        // 用户选择了工程类型
        const selectedType = PROJECT_TYPES.find(
          (t) => t.id === userInput || t.name.includes(userInput) || userInput.includes(t.name)
        );
        if (selectedType) {
          setProjectInfo((prev) => ({ ...prev, type: selectedType.id }));
          addMessage(
            "assistant",
            `明白了，${selectedType.icon} ${selectedType.name}。\n\n请告诉我项目的建设地点在哪里？`,
            "input_location"
          );
        } else {
          addMessage(
            "assistant",
            "抱歉，我没有识别到工程类型。请告诉我：\n\n🛣️ 公路  🏙️ 市政  🌿 生态  💧 水利  🏗️ 建筑  🚄 铁路",
            "input_type"
          );
        }
      } else if (currentPhase === "details") {
        // 用户输入了地点和其他信息
        // 尝试从输入中提取信息
        let infoText = userInput;
        if (!projectInfo.location) {
          setProjectInfo((prev) => ({ ...prev, location: userInput }));
          infoText += "\n\n还需要告诉我：\n- 建设规模（如：双向4车道，全长20公里）\n- 估算投资（如：5亿元）\n\n或者直接告诉我你知道的所有信息";
        } else if (!projectInfo.scale) {
          setProjectInfo((prev) => ({ ...prev, scale: userInput }));
          infoText += "\n\n好的，请告诉我估算投资是多少？";
        } else if (!projectInfo.investment) {
          setProjectInfo((prev) => ({ ...prev, investment: userInput }));
          addMessage(
            "assistant",
            `好的，我已经收集到以下信息：\n\n📋 项目名称：${projectInfo.name}\n🏗️ 工程类型：${PROJECT_TYPES.find((t) => t.id === projectInfo.type)?.name}\n📍 建设地点：${projectInfo.location}\n📏 建设规模：${projectInfo.scale}\n💰 估算投资：${projectInfo.investment}\n\n信息收集完毕！接下来我会为你生成报告大纲，请确认。`,
            "confirm_outline"
          );
          setCurrentPhase("outline");
          return;
        }
        
        addMessage(
          "assistant",
          "好的，还有其他信息想告诉我吗？比如建设规模、估算投资等。\n\n如果信息足够了，请说\"确认\"或\"可以了\"",
          "input_details"
        );
      } else if (currentPhase === "outline") {
        // 用户确认目录
        if (userInput.includes("确认") || userInput.includes("可以") || userInput.includes("好")) {
          await generateReport();
        } else {
          // 用户可能有修改意见，记录下来
          addMessage(
            "assistant",
            "好的，我听到了你的反馈。\n\n现在我将按照以下大纲生成报告：\n\n" +
              outline.map((o, i) => `${i + 1}. ${o.title}`).join("\n") +
              "\n\n请说\"确认\"开始生成，或者告诉我你想修改哪些章节。",
            "confirm_outline"
          );
        }
      } else {
        // 调用 AI 进行智能对话
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userInput,
            projectInfo,
            phase: currentPhase,
          }),
        });
        const data = await response.json();
        if (data.success && data.response) {
          addMessage("assistant", data.response);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      addMessage("assistant", "抱歉，出错了。请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    handleSend();
  };

  const generateReport = async () => {
    setCurrentPhase("generating");
    addMessage("system", "🚀 正在生成报告，请稍候...", "generating");
    setIsLoading(true);

    try {
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
        addMessage(
          "assistant",
          `✅ 报告生成完成！\n\n现在带你去看生成的报告...`
        );
        setTimeout(() => {
          router.push(`/reports?id=${data.report?.id || data.reportId}`);
        }, 1500);
      } else {
        addMessage("assistant", `生成失败：${data.error || "请稍后重试"}`);
        setCurrentPhase("outline");
      }
    } catch (err) {
      console.error("Generate error:", err);
      addMessage("assistant", "生成报告时出错，请稍后重试。");
      setCurrentPhase("outline");
    } finally {
      setIsLoading(false);
    }
  };

  // 快捷回复按钮
  const QuickReplies = () => {
    if (currentPhase === "type") {
      return (
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleQuickReply(t.name)}
              className="px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors"
            >
              {t.icon} {t.name}
            </button>
          ))}
        </div>
      );
    }
    if (currentPhase === "outline") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleQuickReply("确认")}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
          >
            ✅ 确认大纲
          </button>
          <button
            onClick={() => handleQuickReply("修改")}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
          >
            📝 修改章节
          </button>
        </div>
      );
    }
    return null;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span className="font-medium">创建报告</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <a href="/reports" className="hover:text-white">历史报告</a>
            <a href="/templates" className="hover:text-white">模板库</a>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start"}`}
            >
              {msg.role === "system" ? (
                <div className="text-gray-500 text-sm py-2">
                  {msg.content}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-800 text-gray-100 rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              )}
            </div>
          ))}
          
          {/* Quick Replies */}
          {QuickReplies() && !isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                {QuickReplies()}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                currentPhase === "name"
                  ? "例如：成灌高速公路建设工程..."
                  : currentPhase === "type"
                  ? "选择或输入工程类型..."
                  : currentPhase === "details"
                  ? "告诉我更多项目信息..."
                  : currentPhase === "outline"
                  ? "确认或修改..."
                  : "输入你的想法..."
              }
              className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded ${currentPhase === "name" ? "bg-blue-600 text-white" : "bg-gray-800"}`}>① 项目名称</span>
            <span className="text-gray-600">→</span>
            <span className={`px-2 py-0.5 rounded ${currentPhase === "type" ? "bg-blue-600 text-white" : "bg-gray-800"}`}>② 工程类型</span>
            <span className="text-gray-600">→</span>
            <span className={`px-2 py-0.5 rounded ${currentPhase === "details" ? "bg-blue-600 text-white" : "bg-gray-800"}`}>③ 项目详情</span>
            <span className="text-gray-600">→</span>
            <span className={`px-2 py-0.5 rounded ${currentPhase === "outline" ? "bg-blue-600 text-white" : "bg-gray-800"}`}>④ 确认大纲</span>
            <span className="text-gray-600">→</span>
            <span className={`px-2 py-0.5 rounded ${currentPhase === "generating" ? "bg-green-600 text-white" : "bg-gray-800"}`}>⑤ 生成</span>
          </div>
        </div>
      </div>
    </div>
  );
}
