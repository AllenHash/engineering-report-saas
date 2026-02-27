"use client";

import { Eye, X, FileText, Edit3 } from "lucide-react";

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

interface ReportPreviewProps {
  report: Report | null;
  showPanel: boolean;
  onClose: () => void;
  fullscreen?: boolean;
  onExitFullscreen?: () => void;
}

export default function ReportPreview({
  report,
  showPanel,
  onClose,
  fullscreen = false,
  onExitFullscreen,
}: ReportPreviewProps) {
  if (!showPanel) return null;

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="max-w-4xl mx-auto py-8 px-6">
          {/* 预览头部 */}
          <div
            className="flex items-center justify-between mb-6 pb-4 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-lg font-medium text-white">预览模式</span>
            </div>
            <div className="flex items-center gap-2">
              {onExitFullscreen && (
                <button
                  onClick={onExitFullscreen}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  返回编辑
                </button>
              )}
              <button
                onClick={onExitFullscreen || onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 报告内容 - 白底黑字打印效果 */}
          <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900">
            {/* 报告标题 */}
            <div className="mb-8 text-center border-b pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {report?.title || '工程可行性研究报告'}
              </h1>
              {report?.projectInfo && (
                <div className="text-sm text-gray-600">
                  <span>{report.projectInfo.name}</span>
                  {report.projectInfo.location && <span> | {report.projectInfo.location}</span>}
                  {report.projectInfo.type && <span> | {report.projectInfo.type}</span>}
                </div>
              )}
            </div>

            {/* 章节内容 */}
            <div className="space-y-8">
              {report?.sections.map((section, index) => (
                <div key={section.id}>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    {index + 1}. {section.title}
                  </h2>
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800"
                    style={{ lineHeight: '1.8' }}
                  >
                    {section.content || <span className="text-gray-400">（暂无内容）</span>}
                  </div>
                </div>
              ))}
            </div>

            {(!report?.sections || report.sections.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-400">暂无章节内容</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 侧边面板预览
  return (
    <aside
      className="w-96 flex-shrink-0 flex flex-col border-l"
      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}
    >
      {/* 预览面板头部 */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-medium text-white">预览</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 预览内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* 报告标题 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white text-center mb-2">
            {report?.title || '工程可行性研究报告'}
          </h1>
          {report?.projectInfo && (
            <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              <span>{report.projectInfo.name}</span>
              {report.projectInfo.location && <span> | {report.projectInfo.location}</span>}
            </div>
          )}
        </div>

        {/* 章节列表 */}
        <div className="space-y-6">
          {report?.sections.map((section, index) => (
            <div key={section.id} className="mb-6">
              <h2 className="text-base font-semibold text-white mb-2 pb-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                {index + 1}. {section.title}
              </h2>
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-primary)', lineHeight: '1.8' }}
              >
                {section.content || <span style={{ color: 'var(--text-muted)' }}>（暂无内容）</span>}
              </div>
            </div>
          ))}
        </div>

        {(!report?.sections || report.sections.length === 0) && (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无章节内容</p>
          </div>
        )}
      </div>
    </aside>
  );
}