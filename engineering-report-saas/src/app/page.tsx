"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ProjectInfo {
  name: string;
  location: string;
  type: string;
  scale: string;
  investment: string;
}

interface Section {
  id: string;
  title: string;
  content: string;
}

interface ReportData {
  id: string;
  title: string;
  templateName: string;
  projectInfo: ProjectInfo;
  sections: Section[];
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
  const [showReport, setShowReport] = useState(true);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

      // 尝试提取项目信息
      const content = data.message || "";
      
      // 检测项目信息
      const newInfo = { ...projectInfo };
      
      // 提取项目名称
      const nameMatch = content.match(/项目名称[：:]([^\n]+)/) || userMessage.content.match(/(?:名称|叫)([^，。,，]+)/);
      if (nameMatch && !newInfo.name) newInfo.name = nameMatch[1].trim();
      
      // 提取地点
      const locMatch = content.match(/地点[：:]([^\n]+)/) || userMessage.content.match(/(四川|成都|北京|上海)/);
      if (locMatch && !newInfo.location) newInfo.location = locMatch[1] || locMatch[0];
      
      // 提取工程类型
      if (!newInfo.type) {
        if (content.includes("公路") || userMessage.content.includes("公路")) newInfo.type = "highway";
        else if (content.includes("市政") || userMessage.content.includes("市政")) newInfo.type = "municipal";
        else if (content.includes("生态") || userMessage.content.includes("生态")) newInfo.type = "ecology";
      }
      
      if (Object.keys(newInfo).length > 0) {
        setProjectInfo(newInfo);
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
    } finally {
      setIsLoading(false);
    }
  };

  // 生成完整报告
  const handleGenerateReport = async () => {
    if (!projectInfo || !projectInfo.type) {
      alert("请先提供项目信息（名称、地点、工程类型）");
      return;
    }

    setIsGenerating(true);
    
    const templateIdMap: Record<string, string> = {
      highway: "highway-2023",
      municipal: "municipal",
      ecology: "ecology"
    };

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectInfo: projectInfo,
          templateId: templateIdMap[projectInfo.type] || "gov-2023-standard"
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.report);
        
        // 添加系统消息
        const sysMsg: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "✅ 报告已生成完成！请在右侧查看完整内容。",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, sysMsg]);
      } else {
        alert("报告生成失败: " + (data.error || "未知错误"));
      }
    } catch (error) {
      console.error("Generate error:", error);
      alert("报告生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
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
    setProjectInfo(null);
    setReportData(null);
  };

  // 导出报告为Markdown
  const exportReport = () => {
    if (!reportData) return;
    
    let md = `# ${reportData.title}\n\n`;
    md += `**模板**: ${reportData.templateName}\n\n`;
    md += `---\n\n`;
    
    for (const section of reportData.sections) {
      md += `## ${section.title}\n\n`;
      md += section.content + "\n\n";
    }
    
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportData.title}.md`;
    a.click();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
      {/* 左侧：任务栏 */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-950">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-800">
          <span className="text-xl">📋</span>
          <span className="font-semibold text-white">工程报告AI</span>
        </div>
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + 新建对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="mb-2 px-2 text-xs font-medium text-gray-500">对话历史</div>
          <div className="space-y-1">
            <button className="w-full rounded-lg bg-gray-800 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 truncate">
              公路工程报告 - 成灌高速
            </button>
          </div>
        </div>
        <div className="border-t border-gray-800 p-3">
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">
            <span>⚙️</span>
            <span>设置</span>
          </button>
        </div>
      </aside>

      {/* 中间：对话区 */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-6 py-3">
          <h1 className="text-base font-medium text-white">工程可行性报告AI助手</h1>
          <div className="flex gap-2">
            {projectInfo?.name && projectInfo?.location && (
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isGenerating ? "生成中..." : "🚀 生成完整报告"}
              </button>
            )}
            <button
              onClick={() => setShowReport(!showReport)}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
            >
              {showReport ? "隐藏报告" : "显示报告"}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-900 px-4 py-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"}`}>
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
          </div>
        </footer>
      </div>

      {/* 右侧：报告预览 */}
      {showReport && (
        <div className="w-96 flex-shrink-0 flex flex-col border-l border-gray-800 bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📄</span>
              <span className="text-sm font-medium text-white">报告预览</span>
            </div>
            {reportData && (
              <button
                onClick={exportReport}
                className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
              >
                导出
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {reportData ? (
              <div className="space-y-4">
                <div className="border-b border-gray-800 pb-3">
                  <h2 className="text-base font-semibold text-white">{reportData.title}</h2>
                  <p className="mt-1 text-xs text-gray-400">{reportData.templateName}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <div>📍 {reportData.projectInfo.location}</div>
                    <div>📐 {reportData.projectInfo.scale}</div>
                    <div>💰 {reportData.projectInfo.investment}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {reportData.sections.map((section) => (
                    <div key={section.id} className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                      <h3 className="mb-2 text-sm font-medium text-gray-200">{section.title}</h3>
                      <div className="text-xs text-gray-400 whitespace-pre-wrap">
                        {section.content || "（等待生成...）"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-500">
                <div className="mb-3 text-3xl">📄</div>
                <p className="text-sm">完成对话后，点击"生成完整报告"</p>
                <p className="mt-1 text-xs">我会根据您提供的信息生成完整报告</p>
                
                {projectInfo && (
                  <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900 p-3 text-xs">
                    <div className="text-gray-400 mb-2">当前项目信息：</div>
                    {projectInfo.name && <div>📛 名称：{projectInfo.name}</div>}
                    {projectInfo.location && <div>📍 地点：{projectInfo.location}</div>}
                    {projectInfo.type && <div>🏗️ 类型：{projectInfo.type}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}