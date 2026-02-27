"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit3,
  FileText,
  ChevronRight,
  Loader2,
  Check,
  X,
  MoreVertical,
  FolderOpen,
  RefreshCw,
  Download,
  Sparkles,
  Zap,
  XCircle,
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
}

interface Report {
  id: string;
  title: string;
  templateId: string;
  templateName: string;
  projectInfo: ProjectInfo;
  sections: Section[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 编辑状态
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // 生成报告状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState("");
  const [generationCurrentSection, setGenerationCurrentSection] = useState("");
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // 加载报告数据
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    fetchReport();
  }, [user, authLoading, id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/${id}`);
      const data = await res.json();

      if (data.success) {
        setReport(data.report);
        if (data.report.sections && data.report.sections.length > 0) {
          setActiveSectionId(data.report.sections[0].id);
        }
      } else {
        setError(data.error || "加载报告失败");
      }
    } catch (err) {
      setError("加载报告失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 保存报告到数据库
  const saveReport = async (sections?: Section[]) => {
    if (!report) return;

    const sectionsToSave = sections || report.sections;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: sectionsToSave }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setLastSaved(new Date());
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("保存失败: " + (data.error || "未知错误"));
      }
    } catch (err) {
      alert("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  // 自动保存 - 当章节内容变化时自动保存
  useEffect(() => {
    if (!autoSaveEnabled || !report || !activeSectionId) return;

    const timeoutId = setTimeout(() => {
      saveReport();
    }, 2000); // 2秒后自动保存

    return () => clearTimeout(timeoutId);
  }, [report?.sections]);

  // 更新章节内容
  const handleContentChange = (content: string) => {
    if (!report || !activeSectionId) return;

    const updatedSections = report.sections.map((section) =>
      section.id === activeSectionId ? { ...section, content } : section
    );

    setReport({ ...report, sections: updatedSections });
  };

  // 保存当前章节
  const handleSave = async () => {
    if (!report) return;
    await saveReport(report.sections);
  };

  // 一键生成报告
  const handleGenerateReport = async () => {
    if (!report) return;

    // 打开生成进度模态框
    setShowGenerateModal(true);
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationMessage("正在准备生成...");
    setGenerationCurrentSection("");
    setGenerationError(null);
    setGeneratedReport(null);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectInfo: report.projectInfo,
          templateId: report.templateId,
          useSSE: true,
          generateAll: true,
          reportId: report.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || '生成失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              // 处理进度更新
              if (data.progress !== undefined) {
                setGenerationProgress(data.progress);
                setGenerationMessage(data.message || '');
                setGenerationCurrentSection(data.currentSection || '');
              }

              // 处理完成事件
              if (data.report) {
                setGeneratedReport(data.report);
                setGenerationProgress(100);
                setGenerationMessage('生成完成！');
              }
            } catch (e) {
              console.error('Parse SSE error:', e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Generate error:', error);
      setGenerationError(error.message || '生成报告时出现错误');
    } finally {
      setIsGenerating(false);
    }
  };

  // 取消生成
  const handleCancelGenerate = async () => {
    if (!report) return;

    try {
      await fetch(`/api/reports/generate?reportId=${report.id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Cancel error:', e);
    }

    setIsGenerating(false);
    setShowGenerateModal(false);
    setGenerationMessage("");
  };

  // 应用生成的报告内容
  const handleApplyGeneratedReport = async () => {
    if (!generatedReport || !report) return;

    const updatedReport = {
      ...report,
      sections: generatedReport.sections,
      title: generatedReport.title
    };

    setReport(updatedReport);
    setShowGenerateModal(false);

    // 自动保存
    await saveReport(generatedReport.sections);

    // 激活第一个章节
    if (generatedReport.sections.length > 0) {
      setActiveSectionId(generatedReport.sections[0].id);
    }
  };

  // 开始编辑标题
  const startEditTitle = (section: Section) => {
    setEditingTitle(section.id);
    setTempTitle(section.title);
  };

  // 取消编辑标题
  const cancelEditTitle = () => {
    setEditingTitle(null);
    setTempTitle("");
  };

  // 保存标题修改
  const saveTitle = async () => {
    if (!report || !editingTitle || !tempTitle.trim()) return;

    const updatedSections = report.sections.map((section) =>
      section.id === editingTitle ? { ...section, title: tempTitle.trim() } : section
    );

    setReport({ ...report, sections: updatedSections });
    setEditingTitle(null);
    setTempTitle("");

    await saveReport(updatedSections);
  };

  // 删除章节
  const deleteSection = async (sectionId: string) => {
    if (!report) return;
    if (!confirm("确定要删除这个章节吗？")) return;

    const updatedSections = report.sections.filter((s) => s.id !== sectionId);
    setReport({ ...report, sections: updatedSections });

    if (activeSectionId === sectionId) {
      setActiveSectionId(updatedSections.length > 0 ? updatedSections[0].id : null);
    }

    await saveReport(updatedSections);
  };

  // 添加新章节
  const addSection = async () => {
    if (!report || !newSectionTitle.trim()) return;

    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: newSectionTitle.trim(),
      content: "",
    };

    const updatedSections = [...report.sections, newSection];
    setReport({ ...report, sections: updatedSections });
    setActiveSectionId(newSection.id);
    setShowAddSection(false);
    setNewSectionTitle("");

    await saveReport(updatedSections);
  };

  // 获取当前激活的章节
  const activeSection = report?.sections.find((s) => s.id === activeSectionId);

  // loading 状态
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
          <p style={{ color: 'var(--text-muted)' }}>加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <X className="w-8 h-8" style={{ color: '#f87171' }} />
          </div>
          <h2 className="text-xl font-semibold text-white">加载失败</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error || "报告不存在"}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] border border-amber-500/30"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)' }}
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* 左侧栏 - 章节列表 */}
      <aside
        className="w-72 flex-shrink-0 flex flex-col border-r"
        style={{ borderColor: 'var(--border-color)', background: 'linear-gradient(180deg, #0f172a 0%, #0d1321 100%)' }}
      >
        {/* 返回按钮和标题 */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm transition-colors hover:text-white mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>
          <h2 className="text-sm font-medium text-white truncate" title={report.title}>
            {report.title}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {report.templateName}
          </p>
        </div>

        {/* 章节列表 */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              章节列表 ({report.sections.length})
            </span>
            <button
              onClick={() => setShowAddSection(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-200 hover:bg-white/10"
              style={{ color: 'var(--accent-primary)' }}
            >
              <Plus className="w-3 h-3" />
              添加
            </button>
          </div>

          {/* 添加章节输入框 */}
          {showAddSection && (
            <div className="mb-3 p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSection()}
                placeholder="请输入章节标题"
                className="w-full px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none focus:border-amber-500/50"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={addSection}
                  className="flex-1 py-1.5 rounded-lg text-xs text-white transition-all duration-200 hover:shadow-lg"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  添加
                </button>
                <button
                  onClick={() => { setShowAddSection(false); setNewSectionTitle(""); }}
                  className="flex-1 py-1.5 rounded-lg text-xs transition-all duration-200 border"
                  style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 章节列表 */}
          <div className="space-y-2">
            {report.sections.map((section, index) => (
              <div
                key={section.id}
                className={`group rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeSectionId === section.id
                    ? 'border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'border-transparent hover:border-white/10 hover:bg-white/5'
                }`}
                style={{
                  background: activeSectionId === section.id
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
                    : 'transparent'
                }}
                onClick={() => setActiveSectionId(section.id)}
              >
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      {editingTitle === section.id ? (
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle();
                            if (e.key === "Escape") cancelEditTitle();
                          }}
                          onBlur={saveTitle}
                          className="w-full px-2 py-1 rounded text-sm bg-transparent border focus:outline-none"
                          style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-primary)' }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm text-white truncate block">{section.title}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditTitle(section); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                        style={{ color: '#f87171' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1.5 text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {section.content ? section.content.substring(0, 50) + (section.content.length > 50 ? "..." : "") : "（暂无内容）"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {report.sections.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无章节</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>点击上方"添加"按钮新建章节</p>
            </div>
          )}
        </div>
      </aside>

      {/* 中间栏 - 内容编辑区 */}
      <main className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg-primary)' }}>
        {/* 顶部工具栏 */}
        <header
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ borderColor: 'var(--border-color)', background: 'rgba(15, 23, 42, 0.8)' }}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h1 className="text-base font-medium text-white">
              {activeSection?.title || "选择章节进行编辑"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* 项目信息 */}
            {report.projectInfo && (
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                {report.projectInfo.name && (
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {report.projectInfo.name}
                  </span>
                )}
                {report.projectInfo.location && (
                  <span>{report.projectInfo.location}</span>
                )}
              </div>
            )}

            {/* 自动保存开关 */}
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-amber-500"
              />
              自动保存
            </label>

            {/* 最后保存时间 */}
            {lastSaved && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                已保存 {lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}

            {/* 状态提示 */}
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <Check className="w-3.5 h-3.5" />
                保存成功
              </span>
            )}

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 border border-amber-500/30"
              style={{
                background: saveSuccess
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)'
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存
                </>
              )}
            </button>

            {/* 生成报告按钮 */}
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 border border-violet-500/30"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI生成报告
                </>
              )}
            </button>
          </div>
        </header>

        {/* 内容编辑区 */}
        <div className="flex-1 overflow-hidden p-6" style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, #0c1222 100%)' }}>
          {activeSection ? (
            <div className="h-full flex flex-col max-w-4xl mx-auto">
              {/* 章节标题 */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">{activeSection.title}</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  编辑章节内容
                </p>
              </div>

              {/* 内容编辑器 */}
              <div
                className="flex-1 rounded-2xl border overflow-hidden"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              >
                <textarea
                  value={activeSection.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="请输入章节内容..."
                  className="w-full h-full p-6 text-sm leading-relaxed resize-none bg-transparent focus:outline-none"
                  style={{
                    color: 'var(--text-primary)',
                    lineHeight: '1.8',
                  }}
                />
              </div>

              {/* 字数统计 */}
              <div className="flex items-center justify-between mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>字数: {activeSection.content.length}</span>
                <span>最后修改: {new Date(report.updatedAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              <FileText className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg">请选择一个章节进行编辑</p>
              <p className="text-sm mt-2">或点击"添加"按钮创建新章节</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}