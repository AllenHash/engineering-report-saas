"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ReportData {
  title: string;
  type: string;
  outline: string;
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好，你需要写一份什么报告？\n\n我可以帮你编写：\n- 🛣️ 公路工程\n- 🏙️ 市政工程\n- 🌿 生态环境工程",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showReport, setShowReport] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.state && data.state.type && data.state.name) {
        const newReportData: ReportData = {
          title: data.state.name,
          type: data.state.type,
          outline: data.message.includes("##") ? data.message : "",
          content: ""
        };
        setReportData(newReportData);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "抱歉，我遇到了一些问题，请稍后重试。",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "抱歉，连接出现了问题，请稍后重试。",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "你好，你需要写一份什么报告？\n\n我可以帮你编写：\n- 🛣️ 公路工程\n- 🏙️ 市政工程\n- 🌿 生态环境工程",
        timestamp: new Date(),
      },
    ]);
    setReportData(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
      {/* 左侧：任务栏 */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-950">
        {/* Logo/标题 */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-800">
          <span className="text-xl">📋</span>
          <span className="font-semibold text-white">工程报告AI</span>
        </div>

        {/* 新建对话按钮 */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + 新建对话
          </button>
        </div>

        {/* 对话历史列表（占位） */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="mb-2 px-2 text-xs font-medium text-gray-500">对话历史</div>
          <div className="space-y-1">
            <button className="w-full rounded-lg bg-gray-800 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 truncate">
              公路工程报告 - 成灌高速
            </button>
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-800/50 truncate">
              市政工程报告
            </button>
          </div>
        </div>

        {/* 底部设置 */}
        <div className="border-t border-gray-800 p-3">
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">
            <span>⚙️</span>
            <span>设置</span>
          </button>
        </div>
      </aside>

      {/* 中间：对话区 + 右侧预览 */}
      <main className="flex flex-1 overflow-hidden">
        {/* 对话区域 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部标题 */}
          <header className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-6 py-3">
            <h1 className="text-base font-medium text-white">
              工程可行性报告AI助手
            </h1>
            <button
              onClick={() => setShowReport(!showReport)}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
            >
              {showReport ? "隐藏报告" : "显示报告"}
            </button>
          </header>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto bg-gray-900 px-4 py-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : message.role === "system"
                        ? "bg-yellow-900/50 text-yellow-200"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    <div className={`mt-1.5 text-xs ${message.role === "user" ? "text-blue-300" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-gray-800 px-4 py-3">
                    <div className="flex space-x-1.5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: "0.1s" }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 输入框 */}
          <footer className="border-t border-gray-800 bg-gray-950 px-4 py-4">
            <div className="mx-auto max-w-3xl">
              <div className="flex gap-3 rounded-xl border border-gray-700 bg-gray-900 p-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的需求..."
                  className="flex-1 resize-none rounded-lg bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                  rows={1}
                  style={{ minHeight: "40px", maxHeight: "100px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  发送
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-600">
                按 Enter 发送，Shift + Enter 换行
              </p>
            </div>
          </footer>
        </div>

        {/* 右侧：报告预览 */}
        {showReport && (
          <div className="w-96 flex-shrink-0 flex flex-col border-l border-gray-800 bg-gray-950">
            <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
              <span className="text-base">📄</span>
              <span className="text-sm font-medium text-white">报告预览</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {reportData ? (
                <div className="space-y-4">
                  <div className="border-b border-gray-800 pb-3">
                    <h2 className="text-base font-semibold text-white">{reportData.title}</h2>
                    <p className="mt-1 text-xs text-gray-400">
                      {reportData.type === "highway" && "公路工程"}
                      {reportData.type === "municipal" && "市政工程"}
                      {reportData.type === "ecology" && "生态环境工程"}
                      {" - 可行性研究报告"}
                    </p>
                  </div>

                  {reportData.outline && (
                    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                      <h3 className="mb-2 text-sm font-medium text-gray-300">📋 报告大纲</h3>
                      <div className="prose prose-sm max-w-none text-xs text-gray-400 whitespace-pre-wrap">
                        {reportData.outline}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-dashed border-gray-800 p-6 text-center">
                    <p className="text-sm text-gray-500">📝 报告内容生成中...</p>
                    <p className="mt-1 text-xs text-gray-600">随对话进行，内容会逐步完善</p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-500">
                  <div className="mb-3 text-3xl">📄</div>
                  <p className="text-sm">开始对话后，报告将在此显示</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}