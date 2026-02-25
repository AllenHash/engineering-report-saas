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

      // 检查是否需要更新报告数据
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            📋 工程可行性报告AI助手
          </h1>
          <button 
            onClick={handleNewChat}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            新建对话
          </button>
        </div>
      </header>

      {/* Main Content: Left Chat + Right Report */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat Area */}
        <div className="w-1/2 flex flex-col border-r bg-gray-50">
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 py-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : message.role === "system"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-white border border-gray-200 text-gray-900"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div
                        className={`mt-1 text-xs ${
                          message.role === "user"
                            ? "text-blue-200"
                            : "text-gray-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white border border-gray-200 px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0.1s" }}></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </main>

          {/* Input */}
          <footer className="border-t bg-white px-4 py-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的需求..."
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                rows={1}
                style={{ minHeight: "40px", maxHeight: "80px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                发送
              </button>
            </div>
          </footer>
        </div>

        {/* Right: Report Preview */}
        <div className="w-1/2 flex flex-col bg-white">
          <div className="border-b bg-gray-50 px-4 py-2">
            <h2 className="text-sm font-medium text-gray-700">📄 报告预览</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {reportData ? (
              <div className="space-y-4">
                {/* 报告标题 */}
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{reportData.title}</h3>
                  <p className="text-sm text-gray-500">
                    {reportData.type === "highway" && "公路工程"}
                    {reportData.type === "municipal" && "市政工程"}
                    {reportData.type === "ecology" && "生态环境工程"}
                    {" 可行性研究报告"}
                  </p>
                </div>

                {/* 大纲 */}
                {reportData.outline && (
                  <div className="rounded-lg border bg-gray-50 p-3">
                    <h4 className="mb-2 text-sm font-medium text-gray-700">报告大纲</h4>
                    <div className="prose prose-sm max-w-none text-xs text-gray-600 whitespace-pre-wrap">
                      {reportData.outline}
                    </div>
                  </div>
                )}

                {/* 报告内容占位 */}
                <div className="rounded-lg border border-dashed p-8 text-center text-gray-400">
                  <p className="text-sm">📝 报告内容将在这里显示</p>
                  <p className="mt-1 text-xs">随着对话进行，内容会逐步生成</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <div className="mb-4 text-4xl">📄</div>
                <p className="text-sm">开始对话后，报告内容将显示在这里</p>
                <p className="mt-1 text-xs">右侧区域用于预览和编辑生成的报告</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}