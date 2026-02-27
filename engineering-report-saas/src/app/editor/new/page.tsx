"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";

// Lucide图标
import {
  FileText,
  ArrowLeft,
  Plus,
  Building2,
  Waypoints,
  TreeDeciduous,
  Rocket,
  Zap,
  Droplets,
  Factory,
  Loader2,
  CheckCircle2
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
  sections: OutlineSection[];
  isPremium?: boolean;
  pointsRequired?: number;
}

export default function NewReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<"template" | "info">("template");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "",
    scale: "",
    investment: "",
    description: ""
  });

  // 项目类型选项
  const projectTypes = [
    { value: "房建", label: "房屋建筑工程", icon: Building2 },
    { value: "市政道路", label: "市政道路工程", icon: Waypoints },
    { value: "市政管网", label: "市政管网工程", icon: Droplets },
    { value: "生态环境", label: "生态环境工程", icon: TreeDeciduous },
    { value: "交通", label: "交通枢纽工程", icon: Rocket },
    { value: "电力", label: "电力工程", icon: Zap },
    { value: "工业", label: "工业厂房工程", icon: Factory },
  ];

  // 加载模板列表
  useEffect(() => {
    fetch("/api/templates")
      .then(res => res.json())
      .then(data => {
        // API返回 templates 数组，包含 sections 字段
        if (data.templates && Array.isArray(data.templates)) {
          // 确保模板数据完整，添加默认字段
          const processedTemplates = data.templates.map((t: any) => ({
            ...t,
            isPremium: t.isPremium || false,
            pointsRequired: t.pointsRequired || 0
          }));
          setTemplates(processedTemplates);
        } else if (data.success && data.templates) {
          const processedTemplates = data.templates.map((t: any) => ({
            ...t,
            isPremium: t.isPremium || false,
            pointsRequired: t.pointsRequired || 0
          }));
          setTemplates(processedTemplates);
        }
      })
      .catch(err => console.error("Failed to load templates:", err))
      .finally(() => setLoadingTemplates(false));
  }, []);

  // 检查登录
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSelectTemplate = (template: Template | null) => {
    setSelectedTemplate(template);
    setStep("info");
  };

  const handleCreateReport = async () => {
    if (!formData.title.trim()) {
      toast.showWarning("请输入项目名称");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    setIsCreating(true);

    try {
      // 创建默认章节结构
      const defaultSections = selectedTemplate?.sections.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        content: ""
      })) || [];

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          templateId: selectedTemplate?.id || null,
          templateName: selectedTemplate?.name || null,
          projectInfo: {
            name: formData.title,
            location: formData.location,
            type: formData.type,
            scale: formData.scale,
            investment: formData.investment,
            description: formData.description
          },
          sections: defaultSections,
          status: "draft"
        })
      });

      const data = await res.json();

      if (data.success && data.report) {
        router.push(`/editor/${data.report.id}`);
      } else {
        toast.showError("创建报告失败: " + (data.error || "未知错误"));
      }
    } catch (error) {
      console.error("Create report error:", error);
      alert("创建报告失败，请稍后重试");
    } finally {
      setIsCreating(false);
    }
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
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
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
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">新建报告</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>创建新的工程可行性研究报告</p>
            </div>
          </div>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              step === "info" ? "text-white" : "text-white"
            }`} style={{ background: step === "template" ? 'var(--accent-primary)' : 'var(--accent-success)' }}>
              {step === "info" ? "1" : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <span className="text-sm" style={{ color: step === "template" ? 'var(--text-primary)' : 'var(--text-muted)' }}>选择模板</span>
          </div>
          <div className="w-8 h-0.5 mx-2" style={{ background: 'var(--border-color)' }} />
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              step === "info" ? "text-white" : "text-white"
            }`} style={{ background: step === "info" ? 'var(--accent-primary)' : 'var(--border-color)' }}>
              2
            </div>
            <span className="text-sm" style={{ color: step === "info" ? 'var(--text-primary)' : 'var(--text-muted)' }}>填写信息</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 步骤1：选择模板 */}
        {step === "template" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-2">选择报告模板</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>选择您要创建的工程可行性研究报告类型</p>

            {loadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/15 border"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-white mb-1">{template.name}</h3>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{template.industry}</p>
                        <div className="flex flex-wrap gap-1">
                          {(template.sections || []).slice(0, 3).map((chapter) => (
                            <span
                              key={chapter.id}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                            >
                              {chapter.title}
                            </span>
                          ))}
                          {(template.sections?.length || 0) > 3 && (
                            <span className="text-xs px-2 py-0.5" style={{ color: 'var(--text-muted)' }}>
                              +{template.sections.length - 3}章
                            </span>
                          )}
                        </div>
                      </div>
                      {template.isPremium && (
                        <span className="text-xs px-2 py-1 rounded-lg text-white" style={{ background: 'var(--accent-primary)' }}>
                          VIP
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 快速开始 - 直接创建空白报告 */}
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button
                onClick={() => handleSelectTemplate(null)}
                className="w-full p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-white/10 border border-dashed"
                style={{
                  background: 'transparent',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                    <Plus className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">空白报告</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>从零开始创建自定义报告</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 步骤2：填写项目信息 */}
        {step === "info" && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep("template")}
              className="flex items-center gap-2 text-sm mb-4 transition-colors hover:text-white"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              返回选择模板
            </button>

            <h2 className="text-xl font-semibold text-white mb-2">填写项目信息</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {selectedTemplate ? `模板: ${selectedTemplate.name}` : "为空白报告填写基本信息"}
            </p>

            <div className="space-y-5">
              {/* 项目名称 */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  项目名称 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：成都市天府新区某道路建设工程"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-amber-500/50"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* 项目类型 */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">项目类型</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {projectTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className="p-3 rounded-xl text-center transition-all duration-200 hover:scale-[1.02] border"
                        style={{
                          background: formData.type === type.value
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)'
                            : 'var(--bg-secondary)',
                          borderColor: formData.type === type.value
                            ? 'rgba(245, 158, 11, 0.5)'
                            : 'var(--border-color)',
                        }}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: formData.type === type.value ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                        <span className="text-xs" style={{ color: formData.type === type.value ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 地理位置 */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">建设地点</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="例如：四川省成都市天府新区"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-amber-500/50"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* 建设规模和投资 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">建设规模</label>
                  <input
                    type="text"
                    value={formData.scale}
                    onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                    placeholder="例如：道路全长5公里"
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-amber-500/50"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">总投资估算</label>
                  <input
                    type="text"
                    value={formData.investment}
                    onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
                    placeholder="例如：约1.5亿元"
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-amber-500/50"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* 项目描述 */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">项目概述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简要描述项目建设内容、目的和意义..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-amber-500/50 resize-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* 创建按钮 */}
              <div className="pt-4">
                <button
                  onClick={handleCreateReport}
                  disabled={isCreating || !formData.title.trim()}
                  className="w-full py-4 rounded-xl font-medium text-white transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-amber-500/30"
                  style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)' }}
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      创建中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5" />
                      创建报告
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}