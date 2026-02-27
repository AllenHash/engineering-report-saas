"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Lucide图标
import {
  FileText,
  ArrowLeft,
  Save,
  Loader2,
  ChevronRight,
  MapPin,
  Ruler,
  DollarSign,
  Building2,
  FolderOpen,
  Eye,
  Edit3,
  Check,
  X,
  RefreshCw,
  Download,
  FileJson,
  FileCheck,
  AlertCircle
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface ProjectInfo {
  name?: string;
  location?: string;
  type?: string;
  scale?: string;
  investment?: string;
  description?: string;
}

interface Report {
  id: string;
  title: string;
  templateName: string | null;
  projectInfo: ProjectInfo;
  sections: Section[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OutlineItem {
  id: string;
  title: string;
  children?: { id: string; title: string }[];
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 编辑器状态
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [previewMode, setPreviewMode] = useState<"split" | "edit" | "preview">("split");

  // 左侧面板状态
  const [leftPanelTab, setLeftPanelTab] = useState<"info" | "outline">("info");

  // 是否正在AI生成
  const [isGenerating, setIsGenerating] = useState(false);

  // 加载报告数据
  const loadReport = async () => {
    if (!resolvedParams.id) return;

    try {
      const res = await fetch(`/api/reports/${resolvedParams.id}`);
      const data = await res.json();

      if (data.success && data.report) {
        setReport(data.report);
        // 默认选择第一个章节
        if (data.report.sections && data.report.sections.length > 0) {
          setSelectedSectionId(data.report.sections[0].id);
          setEditedContent(data.report.sections[0].content || "");
        }
      } else {
        alert("报告不存在或无权访问");
        router.push("/");
      }
    } catch (error) {
      console.error("Load report error:", error);
      alert("加载报告失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && resolvedParams.id) {
      loadReport();
    }
  }, [user, authLoading, resolvedParams.id, router]);

  // 监听内容变化
  useEffect(() => {
    if (selectedSectionId && report) {
      const section = report.sections.find(s => s.id === selectedSectionId);
      if (section && section.content !== editedContent) {
        setHasUnsavedChanges(true);
      }
    }
  }, [editedContent, selectedSectionId, report]);

  // 切换章节
  const handleSelectSection = (section: Section) => {
    // 如果有未保存的更改，提示用户
    if (hasUnsavedChanges) {
      const confirm = window.confirm("当前章节有未保存的更改，是否保存？");
      if (confirm) {
        handleSaveSection();
      }
    }
    setSelectedSectionId(section.id);
    setEditedContent(section.content || "");
    setHasUnsavedChanges(false);
  };

  // 保存当前章节
  const handleSaveSection = async () => {
    if (!report || !selectedSectionId) return;

    setSaving(true);
    try {
      const updatedSections = report.sections.map(s =>
        s.id === selectedSectionId ? { ...s, content: editedContent } : s
      );

      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: updatedSections
        })
      });

      const data = await res.json();

      if (data.success) {
        setReport({ ...report, sections: updatedSections });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } else {
        alert("保存失败: " + (data.error || "未知错误"));
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  // 保存项目信息
  const handleSaveProjectInfo = async (newInfo: ProjectInfo) => {
    if (!report) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectInfo: newInfo
        })
      });

      const data = await res.json();

      if (data.success) {
        setReport({ ...report, projectInfo: newInfo });
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Save info error:", error);
    } finally {
      setSaving(false);
    }
  };

  // 生成单个章节内容（通过AI）
  const handleGenerateSection = async () => {
    if (!report || !selectedSectionId) return;

    const section = report.sections.find(s => s.id === selectedSectionId);
    if (!section) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `请为工程可行性报告生成 "${section.title}" 章节的内容。项目信息：${JSON.stringify(report.projectInfo)}`
            }
          ]
        })
      });

      const data = await response.json();

      if (data.message) {
        setEditedContent(data.message);
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error("Generate section error:", error);
      alert("生成内容失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  // 导出为Markdown
  const handleExportMarkdown = () => {
    if (!report) return;

    let md = `# ${report.title}\n\n`;
    md += `**模板**: ${report.templateName || '自定义'}\n\n`;
    md += `---\n\n`;
    md += `## 项目信息\n\n`;
    md += `- 项目名称: ${report.projectInfo.name || '-'}\n`;
    md += `- 建设地点: ${report.projectInfo.location || '-'}\n`;
    md += `- 项目类型: ${report.projectInfo.type || '-'}\n`;
    md += `- 建设规模: ${report.projectInfo.scale || '-'}\n`;
    md += `- 投资估算: ${report.projectInfo.investment || '-'}\n\n`;
    md += `---\n\n`;

    for (const section of report.sections) {
      md += `## ${section.title}\n\n`;
      md += section.content || "(待补充)" + "\n\n";
    }

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title}.md`;
    a.click();
  };

  // 可视化章节树
  const renderOutline = () => {
    if (!report || report.sections.length === 0) {
      return (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无章节</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {report.sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => handleSelectSection(section)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-white/5"
            style={{
              background: selectedSectionId === section.id
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
                : 'transparent',
              border: selectedSectionId === section.id
                ? '1px solid rgba(245, 158, 11, 0.3)'
                : '1px solid transparent',
              color: selectedSectionId === section.id
                ? 'var(--accent-primary)'
                : 'var(--text-secondary)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{
                background: selectedSectionId === section.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: selectedSectionId === section.id ? 'white' : 'var(--text-muted)'
              }}>
                {index + 1}
              </span>
              <span className="truncate flex-1">{section.title}</span>
              {section.content && selectedSectionId !== section.id && (
                <Check className="w-3 h-3 text-emerald-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  // 获取当前选中的章节
  const currentSection = report?.sections.find(s => s.id === selectedSectionId);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: 'var(--accent-primary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>加载报告中...</p>
        </div>
      </div>
    );
  }

  if (!user || !report) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* 左侧：项目信息面板 */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'var(--border-color)', background: 'linear-gradient(180deg, #0f172a 0%, #0d1321 100%)' }}>
        {/* 头部 */}
        <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{report.title}</h2>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{report.templateName || '自定义报告'}</p>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setLeftPanelTab("info")}
            className="flex-1 py-3 text-xs font-medium transition-all duration-200 border-b-2"
            style={{
              color: leftPanelTab === "info" ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: leftPanelTab === "info" ? '2px solid var(--accent-primary)' : '2px solid transparent',
              background: leftPanelTab === "info" ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
            }}
          >
            项目信息
          </button>
          <button
            onClick={() => setLeftPanelTab("outline")}
            className="flex-1 py-3 text-xs font-medium transition-all duration-200 border-b-2"
            style={{
              color: leftPanelTab === "outline" ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: leftPanelTab === "outline" ? '2px solid var(--accent-primary)' : '2px solid transparent',
              background: leftPanelTab === "outline" ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
            }}
          >
            章节列表
          </button>
        </div>

        {/* 面板内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {leftPanelTab === "info" && (
            <div className="space-y-4 animate-fade-in">
              {/* 基本信息卡片 */}
              <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  基本信息
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs" style={{ color: 'var(--text-muted)' }}>项目名称</label>
                    <p className="text-sm text-white mt-1">{report.projectInfo.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: 'var(--text-muted)' }}>项目类型</label>
                    <p className="text-sm text-white mt-1">{report.projectInfo.type || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 位置信息 */}
              <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                  位置信息
                </h3>
                <p className="text-sm text-white">{report.projectInfo.location || '未设置'}</p>
              </div>

              {/* 规模信息 */}
              <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
                  <Ruler className="w-4 h-4" style={{ color: 'var(--accent-success)' }} />
                  建设规模
                </h3>
                <p className="text-sm text-white">{report.projectInfo.scale || '未设置'}</p>
              </div>

              {/* 投资信息 */}
              <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  投资估算
                </h3>
                <p className="text-sm text-white">{report.projectInfo.investment || '未设置'}</p>
              </div>
            </div>
          )}

          {leftPanelTab === "outline" && (
            <div className="animate-fade-in">
              {renderOutline()}
            </div>
          )}
        </div>

        {/* 底部保存状态 */}
        <div className="p-3 border-t text-xs" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
          {lastSaved ? (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Check className="w-3 h-3 text-emerald-500" />
              已保存 {lastSaved.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          ) : (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <AlertCircle className="w-3 h-3" />
              {hasUnsavedChanges ? '有未保存的更改' : '尚未保存'}
            </div>
          )}
        </div>
      </aside>

      {/* 中间：章节内容编辑器 */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg-primary)' }}>
        {/* 顶部工具栏 */}
        <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
              <FileText className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-sm text-white">{currentSection?.title || '选择章节'}</span>
            </div>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 视图切换 */}
            <div className="flex rounded-lg p-1 mr-2" style={{ background: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setPreviewMode("edit")}
                className="px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-all"
                style={{
                  background: previewMode === "edit" ? 'var(--bg-tertiary)' : 'transparent',
                  color: previewMode === "edit" ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}
              >
                <Edit3 className="w-3 h-3" />
                编辑
              </button>
              <button
                onClick={() => setPreviewMode("split")}
                className="px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-all"
                style={{
                  background: previewMode === "split" ? 'var(--bg-tertiary)' : 'transparent',
                  color: previewMode === "split" ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}
              >
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 rounded-sm" style={{ background: 'currentColor' }} />
                  <div className="w-1 h-3 rounded-sm" style={{ background: 'currentColor', opacity: 0.5 }} />
                </div>
                分屏
              </button>
              <button
                onClick={() => setPreviewMode("preview")}
                className="px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-all"
                style={{
                  background: previewMode === "preview" ? 'var(--bg-tertiary)' : 'transparent',
                  color: previewMode === "preview" ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}
              >
                <Eye className="w-3 h-3" />
                预览
              </button>
            </div>

            {/* AI生成按钮 */}
            <button
              onClick={handleGenerateSection}
              disabled={!selectedSectionId || isGenerating}
              className="px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: 'white' }}
            >
              {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              AI续写
            </button>

            {/* 保存按钮 */}
            <button
              onClick={handleSaveSection}
              disabled={!hasUnsavedChanges || saving}
              className="px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed border"
              style={{
                background: hasUnsavedChanges ? 'linear-gradient(135deg, var(--accent-success) 0%, #059669 100%)' : 'var(--bg-tertiary)',
                borderColor: hasUnsavedChanges ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-color)',
                color: hasUnsavedChanges ? 'white' : 'var(--text-muted)'
              }}
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              保存
            </button>

            {/* 导出按钮 */}
            <button
              onClick={handleExportMarkdown}
              className="px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-200 hover:bg-white/10 border"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <Download className="w-3 h-3" />
              导出
            </button>

            {/* 用户信息 */}
            <div className="flex items-center gap-2 ml-3 pl-3 border-l" style={{ borderColor: 'var(--border-color)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #1d4ed8 100%)' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* 编辑器主体 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 编辑区 */}
          {(previewMode === "edit" || previewMode === "split") && (
            <div className={`${previewMode === "split" ? "w-1/2 border-r" : "w-full"} flex flex-col`} style={{ borderColor: 'var(--border-color)' }}>
              <div className="px-4 py-2 border-b text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
                编辑模式
              </div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder={selectedSectionId ? "在此编辑章节内容..." : "请先在左侧选择章节"}
                disabled={!selectedSectionId}
                className="flex-1 w-full p-4 text-sm resize-none focus:outline-none leading-relaxed"
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.8'
                }}
              />
            </div>
          )}

          {/* 预览区 */}
          {(previewMode === "preview" || previewMode === "split") && (
            <div className={`${previewMode === "split" ? "w-1/2" : "w-full"} flex flex-col`}>
              <div className="px-4 py-2 border-b text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
                实时预览
              </div>
              <div className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg-secondary)' }}>
                {selectedSectionId ? (
                  <div className="prose prose-invert max-w-none">
                    <h2 className="text-lg font-semibold text-white mb-4">{currentSection?.title}</h2>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                      {editedContent || <span style={{ color: 'var(--text-muted)' }}>（内容为空，请编辑或使用AI生成）</span>}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">请在左侧选择章节</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}