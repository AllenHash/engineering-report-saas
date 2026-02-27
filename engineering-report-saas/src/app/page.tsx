"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { downloadPDF } from "@/lib/pdf-export";

// Lucide图标导入
import {
  FileText,
  FolderOpen,
  Settings,
  User,
  LogOut,
  Send,
  ChevronRight,
  ChevronLeft,
  Download,
  FileJson,
  MapPin,
  Ruler,
  DollarSign,
  Construction,
  Highway,
  Building2,
  Leaf,
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ProjectInfo {
  name?: string;
  location?: string;
  type?: string;
  scale?: string;
  investment?: string;
}

interface Section {
  id: string;
  title: string;
  content: string;
}

interface Project {
  id: string;
  name: string;
  status: "进行中" | "已完成" | "待审批";
  updatedAt: Date;
}

interface ReportData {
  id: string;
  title: string;
  templateName: string;
  projectInfo: ProjectInfo;
  sections: Section[];
}

export default function Home() {
  const { user, logout, loading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好，我是工程可行性报告AI助手。\n\n告诉我你的项目信息，我可以帮你编写：\n• 公路工程可研报告\n• 市政工程可研报告\n• 生态环境影响评价",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [rightTab, setRightTab] = useState<"report" | "file">("report");
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 项目列表状态
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // 加载项目列表
  useEffect(() => {
    if (!user) {
      setIsLoadingProjects(false);
      return;
    }

    fetch("/api/reports")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.reports) {
          const projectList = data.reports.map((r: any) => ({
            id: r.id,
            name: r.title || r.projectName || "新项目",
            status: r.status === "completed" ? "已完成" : r.status === "generating" ? "生成中" : "进行中",
            updatedAt: new Date(r.updatedAt || r.createdAt),
          }));
          setProjects(projectList);
          if (projectList.length > 0 && !currentProjectId) {
            setCurrentProjectId(projectList[0].id);
          }
        }
      })
      .catch(err => console.error("Failed to load projects:", err))
      .finally(() => setIsLoadingProjects(false));
  }, [user]);

  // 确保始终有 currentProjectId
  useEffect(() => {
    if (!isLoadingProjects && projects.length > 0 && !currentProjectId) {
      setCurrentProjectId(projects[0].id);
    }
  }, [isLoadingProjects, projects, currentProjectId]);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // loading 状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 检查是否登录
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

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
      const nameMatch = content.match(/项目名称[：:]?([^\n]+)/) || userMessage.content.match(/(?:名称|叫)([^，。,，]+)/);
      if (nameMatch && !newInfo.name) newInfo.name = nameMatch[1].trim();

      // 提取地点
      const locMatch = content.match(/地点[：:]?([^\n]+)/) || userMessage.content.match(/(四川|成都|北京|上海)/);
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

  const handleNewProject = async () => {
    // 检查是否登录
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    // 在数据库中创建新报告
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "新项目 " + (projects.length + 1),
          projectInfo: {},
          sections: [],
        }),
      });

      const data = await res.json();

      if (data.success && data.report) {
        const newProject: Project = {
          id: data.report.id,
          name: data.report.title,
          status: "进行中",
          updatedAt: new Date()
        };
        setProjects(prev => [newProject, ...prev]);
        setCurrentProjectId(newProject.id);
      } else {
        // 如果API失败，使用本地创建
        const newProject: Project = {
          id: Date.now().toString(),
          name: "新项目 " + (projects.length + 1),
          status: "进行中",
          updatedAt: new Date()
        };
        setProjects(prev => [newProject, ...prev]);
        setCurrentProjectId(newProject.id);
      }
    } catch (err) {
      console.error("Create project error:", err);
      // 使用本地创建作为后备
      const newProject: Project = {
        id: Date.now().toString(),
        name: "新项目 " + (projects.length + 1),
        status: "进行中",
        updatedAt: new Date()
      };
      setProjects(prev => [newProject, ...prev]);
      setCurrentProjectId(newProject.id);
    }

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

  // 切换项目
  const handleSelectProject = async (projectId: string) => {
    setCurrentProjectId(projectId);

    // 从数据库加载项目数据
    try {
      const res = await fetch(`/api/reports/${projectId}`);
      const data = await res.json();

      if (data.success && data.report) {
        const report = data.report;
        setProjectInfo(report.projectInfo);
        setReportData({
          id: report.id,
          title: report.title,
          templateName: report.templateName || '',
          projectInfo: report.projectInfo,
          sections: report.sections || []
        });

        // 清空对话，重新开始
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: "你好，你需要写一份什么报告？\n\n我可以帮你编写：\n- 🛣️ 公路工程\n- 🏙️ 市政工程\n- 🌿 生态环境工程",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("Load project error:", err);
    }
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

  // 导出报告为PDF
  const exportReportPDF = () => {
    if (!reportData) return;
    downloadPDF(reportData, `${reportData.title}.pdf`);
  };

  // 获取当前项目
  const currentProject = projects.find(p => p.id === currentProjectId);

  // 状态颜色映射 - 使用设计指南配色
  const statusColors: Record<string, string> = {
    "进行中": "bg-amber-500/20 text-amber-400",
    "已完成": "bg-emerald-500/20 text-emerald-400",
    "待审批": "bg-orange-500/20 text-orange-400",
    "生成中": "bg-blue-500/20 text-blue-400"
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* 左侧栏 - 项目列表 */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r transition-all duration-300" style={{ borderColor: 'var(--border-color)', background: 'linear-gradient(180deg, #0f172a 0%, #0d1321 100%)' }}>
        {/* Logo区域 */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #d97706 100%)' }}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm tracking-wide">我的项目</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>工程可行性报告</p>
          </div>
        </div>

        {/* 新建项目按钮 - 琥珀色强调 */}
        <div className="p-3">
          <button
            onClick={handleNewProject}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/20"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)' }}
          >
            <Plus className="w-4 h-4" />
            <span>新建项目</span>
          </button>
        </div>

        {/* 项目列表 */}
        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无项目</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>点击上方"新建项目"开始</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className="w-full rounded-lg px-3 py-3 text-left transition-all duration-200 hover:translate-x-1"
                  style={{
                    background: currentProjectId === project.id
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
                      : 'transparent',
                    border: currentProjectId === project.id
                      ? '1px solid rgba(245, 158, 11, 0.3)'
                      : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white truncate flex-1">{project.name}</div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${statusColors[project.status]}`}>
                      {project.status === '已完成' && <CheckCircle2 className="w-3 h-3" />}
                      {project.status === '进行中' && <Clock className="w-3 h-3" />}
                      {project.status === '生成中' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {project.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部设置 */}
        <div className="border-t p-3" style={{ borderColor: 'var(--border-color)' }}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
            <Settings className="w-4 h-4" />
            <span>设置</span>
          </button>
        </div>
      </aside>

      {/* 中间栏 - 对话区 */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg-primary)' }}>
        {/* 顶部导航栏 */}
        <header className="flex items-center justify-between px-6 py-3 border-b backdrop-blur-sm" style={{ borderColor: 'var(--border-color)', background: 'rgba(15, 23, 42, 0.8)' }}>
          <h1 className="text-base font-medium text-white truncate">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              {currentProject?.name || "工程可行性报告AI助手"}
            </span>
          </h1>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 mr-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #1d4ed8 100%)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
              </div>
            )}
            <a
              href="/profile"
              className="rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 transition-all hover:bg-white/5"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' }}
            >
              <User className="w-3 h-3" />
              账号管理
            </a>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 transition-all hover:bg-red-500/10"
              style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <LogOut className="w-3 h-3" />
              退出
            </button>
            {projectInfo?.name && projectInfo?.location && (
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="rounded-lg px-4 py-1.5 text-xs font-medium text-white flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--accent-success) 0%, #059669 100%)' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    生成完整报告
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 transition-all hover:bg-white/5"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' }}
            >
              {showRightPanel ? (
                <>
                  收起
                  <ChevronRight className="w-3 h-3" />
                </>
              ) : (
                <>
                  展开
                  <ChevronLeft className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </header>

        {/* 对话内容区 */}
        <div className="flex-1 overflow-y-auto px-4 py-6" style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, #0c1222 100%)' }}>
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 transition-all duration-200 ${
                    message.role === "user"
                      ? "text-white"
                      : "text-gray-100"
                  }`}
                  style={{
                    background: message.role === "user"
                      ? 'linear-gradient(135deg, var(--accent-secondary) 0%, #1d4ed8 100%)'
                      : 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  <div className={`mt-2 text-xs ${message.role === "user" ? "text-blue-200" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex space-x-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-full animate-bounce"
                        style={{
                          background: 'var(--accent-primary)',
                          animationDelay: `${i * 150}ms`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <footer className="border-t px-4 py-4" style={{ borderColor: 'var(--border-color)', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div className="mx-auto max-w-3xl">
            <div
              className="flex gap-3 rounded-xl p-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-amber-500/30"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述你的项目需求..."
                className="flex-1 resize-none rounded-lg px-4 py-3 text-sm transition-colors bg-transparent focus:outline-none"
                style={{
                  color: 'var(--text-primary)',
                  '::placeholder': { color: 'var(--text-muted)' }
                }}
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="rounded-lg px-5 py-2 text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)' }}
              >
                <Send className="w-4 h-4" />
                发送
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* 右侧栏 - 报告预览/文件预览 (可收起) */}
      {showRightPanel && (
        <aside className="w-96 flex-shrink-0 flex flex-col border-l border-gray-800 bg-gray-950">
          {/* 标签页切换 */}
          <div className="flex items-center border-b border-gray-800">
            <button
              onClick={() => setRightTab("report")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                rightTab === "report"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              📄 报告预览
            </button>
            <button
              onClick={() => setRightTab("file")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                rightTab === "file"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              📁 文件预览
            </button>
          </div>

          {/* 报告预览内容 */}
          {rightTab === "report" && (
            <>
              <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📄</span>
                  <span className="text-sm font-medium text-white">报告预览</span>
                </div>
                {reportData && (
                  <div className="flex gap-2">
                    <button
                      onClick={exportReport}
                      className="rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
                    >
                      📝 Markdown
                    </button>
                    <button
                      onClick={exportReportPDF}
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    >
                      📄 PDF
                    </button>
                  </div>
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
            </>
          )}

          {/* 文件预览内容 */}
          {rightTab === "file" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex h-full flex-col items-center justify-center text-gray-500">
                <div className="mb-3 text-3xl">📁</div>
                <p className="text-sm">暂无文件</p>
                <p className="mt-1 text-xs">生成的报告文件将在这里显示</p>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}