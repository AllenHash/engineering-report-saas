"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Lucide图标
import {
  FileText,
  ArrowLeft,
  Search,
  Filter,
  X,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  FolderOpen,
  Clock,
  Star,
  Building2,
  MapPin,
  Hash,
} from "lucide-react";

interface OutlineSection {
  id: string;
  title: string;
  description?: string;
  children?: OutlineSection[];
}

interface Template {
  id: string;
  name: string;
  industry: string;
  type: string;
  sections: OutlineSection[];
  usageCount: number;
  isSystem?: boolean;
}

interface Industry {
  id: string;
  name: string;
  icon: string;
}

const INDUSTRY_ICONS: Record<string, string> = {
  highway: "🛣️",
  municipal: "🏙️",
  ecology: "🌿",
  water: "💧",
  building: "🏗️",
  rail: "🚇",
  energy: "⚡",
  chemical: "🧪",
  general: "📋",
  other: "📋",
};

// 行业中文名称映射
const INDUSTRY_NAMES: Record<string, string> = {
  highway: "公路工程",
  municipal: "市政工程",
  ecology: "生态环境工程",
  water: "水利工程",
  building: "建筑工程",
  rail: "城市轨道交通",
  energy: "能源工程",
  chemical: "化工医药",
  general: "通用",
  other: "其他",
};

export default function TemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  // 筛选状态
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 预览模态框
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 加载模板数据
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/templates");
      const data = await res.json();

      if (data.templates && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
      if (data.industries && Array.isArray(data.industries)) {
        setIndustries(data.industries);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选模板
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // 行业筛选
    if (selectedIndustry !== "all") {
      result = result.filter(
        (t) => t.industry === selectedIndustry || t.industry === "general"
      );
    }

    // 关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(keyword) ||
          INDUSTRY_NAMES[t.industry]?.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [templates, selectedIndustry, searchKeyword]);

  // 检查登录
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 选择模板
  const handleSelectTemplate = (template: Template) => {
    if (!user) {
      router.push("/login");
      return;
    }
    // 跳转到新建报告页面，带上选中的模板
    router.push(`/editor/new?templateId=${template.id}`);
  };

  // 加载模板详情（用于预览）
  const handlePreview = async (template: Template) => {
    setPreviewTemplate(template);
  };

  // 计算模板章节数量
  const getSectionCount = (template: Template) => {
    return template.sections?.length || 0;
  };

  // 获取子章节数量
  const getSubSectionCount = (template: Template) => {
    return template.sections?.reduce(
      (acc, section) => acc + (section.children?.length || 0),
      0
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-xl transition-all duration-200 hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #d97706 100%)' }}>
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">模板库</h1>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>选择报告模板开始创建</p>
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{templates.length}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>模板总数</div>
            </div>
            <div className="w-px h-8" style={{ background: 'var(--border-color)' }} />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{industries.length}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>行业分类</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* 搜索和筛选工具栏 */}
        <div className="mb-6 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索模板名称..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-amber-500/50"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 筛选和视图控制 */}
          <div className="flex items-center justify-between">
            {/* 行业筛选标签 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedIndustry("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedIndustry === "all"
                    ? "text-white"
                    : "text-sm"
                }`}
                style={{
                  background: selectedIndustry === "all"
                    ? 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)'
                    : 'var(--bg-secondary)',
                  color: selectedIndustry === "all" ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${selectedIndustry === 'all' ? 'transparent' : 'var(--border-color)'}`,
                }}
              >
                全部
              </button>
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedIndustry === industry.id
                      ? "text-white"
                      : "text-sm"
                  }`}
                  style={{
                    background: selectedIndustry === industry.id
                      ? 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)'
                      : 'var(--bg-secondary)',
                    color: selectedIndustry === industry.id ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${selectedIndustry === industry.id ? 'transparent' : 'var(--border-color)'}`,
                  }}
                >
                  {industry.icon} {industry.name}
                </button>
              ))}
            </div>

            {/* 视图切换 */}
            <div className="hidden md:flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-amber-500/20" : "hover:bg-white/5"
                }`}
                style={{ color: viewMode === "grid" ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-amber-500/20" : "hover:bg-white/5"
                }`}
                style={{ color: viewMode === "list" ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 模板列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-medium text-white mb-2">未找到模板</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              尝试调整筛选条件或搜索关键词
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // 网格视图
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/10"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {/* 模板头部 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {INDUSTRY_ICONS[template.industry] || "📋"}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {INDUSTRY_NAMES[template.industry] || template.industry}
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-white line-clamp-2">
                      {template.name}
                    </h3>
                  </div>
                </div>

                {/* 章节预览 */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {(template.sections || []).slice(0, 3).map((section) => (
                      <span
                        key={section.id}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {section.title}
                      </span>
                    ))}
                    {template.sections.length > 3 && (
                      <span
                        className="text-xs px-2 py-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        +{template.sections.length - 3}章
                      </span>
                    )}
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{getSectionCount(template)}章</span>
                    <span className="mx-1">·</span>
                    <span>{getSubSectionCount(template)}节</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/10"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    预览大纲
                  </button>
                  <button
                    onClick={() => handleSelectTemplate(template)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
                    }}
                  >
                    使用模板
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 列表视图
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group p-4 rounded-xl border transition-all duration-200 hover:border-amber-500/30"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      {INDUSTRY_ICONS[template.industry] || "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium text-white truncate">
                          {template.name}
                        </h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {INDUSTRY_NAMES[template.industry] || template.industry}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {getSectionCount(template)}章
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5" />
                          {getSubSectionCount(template)}节
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handlePreview(template)}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/10"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      预览
                    </button>
                    <button
                      onClick={() => handleSelectTemplate(template)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
                      }}
                    >
                      使用
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 预览模态框 */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 遮罩层 */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewTemplate(null)}
          />

          {/* 模态框内容 */}
          <div
            className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
          >
            {/* 模态框头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {INDUSTRY_ICONS[previewTemplate.industry] || "📋"}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">{previewTemplate.name}</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {INDUSTRY_NAMES[previewTemplate.industry] || previewTemplate.industry} · {getSectionCount(previewTemplate)}章 · {getSubSectionCount(previewTemplate)}节
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-xl transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 章节列表 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {previewTemplate.sections?.map((section, index) => (
                  <div
                    key={section.id}
                    className="rounded-xl overflow-hidden"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    {/* 章节标题 */}
                    <div
                      className="px-4 py-3 flex items-center gap-3"
                      style={{ borderBottom: section.children?.length ? `1px solid var(--border-color)` : 'none' }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium text-white"
                        style={{ background: 'var(--accent-primary)' }}
                      >
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-white">{section.title}</span>
                    </div>

                    {/* 子章节 */}
                    {section.children && section.children.length > 0 && (
                      <div className="px-4 py-2 bg-black/20">
                        {section.children.map((child) => (
                          <div
                            key={child.id}
                            className="py-2 flex items-start gap-3"
                          >
                            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                            <div className="flex-1">
                              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {child.title}
                              </span>
                              {child.description && (
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                  {child.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 模态框底部 */}
            <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                关闭预览
              </button>
              <button
                onClick={() => {
                  handleSelectTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
                }}
              >
                使用此模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}