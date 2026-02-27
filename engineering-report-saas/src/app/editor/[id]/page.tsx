"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface Section {
  id: string;
  title: string;
  content: string;
  children?: SubSection[];
}

interface SubSection {
  id: string;
  title: string;
  content: string;
}

interface Report {
  id: string;
  title: string;
  projectInfo: {
    name: string;
    location: string;
    type: string;
    scale: string;
    investment: string;
  };
  sections: Section[];
  createdAt: string;
}

// 模拟报告数据
const MOCK_REPORT: Report = {
  id: "report_001",
  title: "成灌高速公路建设工程可行性研究报告",
  projectInfo: {
    name: "成灌高速公路",
    location: "四川省成都市",
    type: "highway",
    scale: "双向4车道，全长50公里",
    investment: "10亿元",
  },
  sections: [
    {
      id: "1",
      title: "一、概述",
      content: "本章概述了项目的基本情况...",
      children: [
        { id: "1.1", title: "（一）项目概况", content: "项目位于四川省成都市..." },
        { id: "1.2", title: "（二）项目单位概况", content: "项目法人为成都市交通运输局..." },
        { id: "1.3", title: "（三）编制依据", content: "依据《政府投资条例》..." },
        { id: "1.4", title: "（四）主要结论和建议", content: "建议尽快实施本项目..." },
      ],
    },
    {
      id: "2",
      title: "二、项目建设背景和必要性",
      content: "本章分析项目建设的背景和必要性...",
      children: [
        { id: "2.1", title: "（一）项目建设背景", content: "随着经济发展..." },
        { id: "2.2", title: "（二）规划政策符合性", content: "符合《四川省综合交通规划》..." },
        { id: "2.3", title: "（三）项目建设必要性", content: "交通需求日益增长..." },
      ],
    },
    {
      id: "3",
      title: "三、项目需求分析与产出方案",
      content: "本章分析项目需求...",
      children: [
        { id: "3.1", title: "（一）需求分析", content: "根据交通调查..." },
        { id: "3.2", title: "（二）建设内容和规模", content: "建设标准为高速公路..." },
        { id: "3.3", title: "（三）项目产出方案", content: "正常年份通行费收入..." },
      ],
    },
    {
      id: "4",
      title: "四、项目选址与要素保障",
      content: "本章论述选址方案...",
      children: [
        { id: "4.1", title: "（一）项目选址或选线", content: "经过多方案比选..." },
        { id: "4.2", title: "（二）项目建设条件", content: "地形地貌条件..." },
        { id: "4.3", title: "（三）要素保障分析", content: "土地利用符合规划..." },
      ],
    },
    {
      id: "5",
      title: "五、项目建设方案",
      content: "本章描述建设方案...",
      children: [
        { id: "5.1", title: "（一）技术方案", content: "采用高速公路标准..." },
        { id: "5.2", title: "（二）设备方案", content: "监控系统、收费系统..." },
        { id: "5.3", title: "（三）工程方案", content: "路基、路面、桥梁..." },
      ],
    },
    {
      id: "6",
      title: "六、投资估算与资金筹措",
      content: "本章计算投资...",
      children: [
        { id: "6.1", title: "（一）投资估算", content: "总投资10亿元..." },
        { id: "6.2", title: "（二）资金筹措", content: "政府投资+银行贷款..." },
      ],
    },
    {
      id: "7",
      title: "七、财务评价",
      content: "本章进行财务分析...",
      children: [
        { id: "7.1", title: "（一）财务评价依据", content: "依据相关规定..." },
        { id: "7.2", title: "（二）财务分析", content: "财务内部收益率..." },
        { id: "7.3", title: "（三）不确定性分析", content: "敏感性分析..." },
      ],
    },
    {
      id: "8",
      title: "八、社会评价",
      content: "本章进行社会分析...",
      children: [
        { id: "8.1", title: "（一）社会影响分析", content: "促进区域经济发展..." },
        { id: "8.2", title: "（二）互适性分析", content: "公众支持度较高..." },
        { id: "8.3", title: "（三）社会风险分析", content: "无重大社会风险..." },
      ],
    },
  ],
  createdAt: "2026-02-27T10:00:00Z",
};

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [report, setReport] = useState<Report | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedSubSection, setSelectedSubSection] = useState<SubSection | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  // 加载报告数据
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    // 模拟加载报告
    setReport(MOCK_REPORT);
    if (MOCK_REPORT.sections.length > 0) {
      setSelectedSection(MOCK_REPORT.sections[0]);
      setEditContent(MOCK_REPORT.sections[0].content);
    }
  }, [user, authLoading, router]);

  // 选择章节
  const handleSelectSection = (section: Section) => {
    // 先保存当前编辑的内容
    if (selectedSection && editContent !== selectedSection.content) {
      saveContent();
    }
    setSelectedSection(section);
    setSelectedSubSection(null);
    setEditContent(section.content);
  };

  // 选择小节
  const handleSelectSubSection = (section: Section, subSection: SubSection) => {
    // 先保存当前编辑的内容
    if (selectedSubSection && editContent !== selectedSubSection.content) {
      saveSubSectionContent();
    }
    setSelectedSection(section);
    setSelectedSubSection(subSection);
    setEditContent(subSection.content);
  };

  // 保存章节内容
  const saveContent = async () => {
    if (!selectedSection || !report) return;

    setIsSaving(true);
    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 500));

    setReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === selectedSection.id ? { ...s, content: editContent } : s
        ),
      };
    });
    setIsSaving(false);
  };

  // 保存小节内容
  const saveSubSectionContent = async () => {
    if (!selectedSubSection || !selectedSection || !report) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id !== selectedSection.id) return s;
          return {
            ...s,
            children: s.children?.map((c) =>
              c.id === selectedSubSection.id ? { ...c, content: editContent } : c
            ),
          };
        }),
      };
    });
    setIsSaving(false);
  };

  // AI 重写
  const handleAiRewrite = async () => {
    if (!aiInput.trim()) return;

    setIsAiLoading(true);
    setAiResult("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `请根据以下要求重写内容：${aiInput}\n\n当前内容：${editContent}`,
          projectInfo: report?.projectInfo,
          context: [],
        }),
      });

      const data = await response.json();
      if (data.success && data.response) {
        setAiResult(data.response);
      } else {
        setAiResult("AI 生成失败，请重试");
      }
    } catch (err) {
      setAiResult("请求失败，请重试");
    } finally {
      setIsAiLoading(false);
    }
  };

  // 应用 AI 结果
  const applyAiResult = () => {
    if (aiResult) {
      setEditContent(aiResult);
      setShowAiPanel(false);
      setAiInput("");
      setAiResult("");
    }
  };

  if (authLoading || !report) {
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
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/reports")}
              className="text-gray-400 hover:text-white"
            >
              ← 返回
            </button>
            <div>
              <h1 className="font-medium">{report.title}</h1>
              <p className="text-xs text-gray-500">
                {report.projectInfo.name} · {report.projectInfo.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                showAiPanel
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🤖 AI 助手
            </button>
            <button
              onClick={selectedSubSection ? saveSubSectionContent : saveContent}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：章节导航 */}
        <aside className="w-80 border-r border-gray-800 overflow-y-auto bg-gray-800/30">
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-400 mb-4">章节结构</h2>
            <div className="space-y-2">
              {report.sections.map((section) => (
                <div key={section.id}>
                  {/* 一级章节 */}
                  <button
                    onClick={() => handleSelectSection(section)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSection?.id === section.id && !selectedSubSection
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {section.title}
                  </button>

                  {/* 二级章节 */}
                  {selectedSection?.id === section.id && section.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {section.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleSelectSubSection(section, child)}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                            selectedSubSection?.id === child.id
                              ? "bg-purple-600/30 text-purple-300"
                              : "text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          {child.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 中间：编辑器 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedSection && (
            <>
              <div className="border-b border-gray-800 px-6 py-4">
                <h2 className="text-lg font-medium">
                  {selectedSubSection ? selectedSubSection.title : selectedSection.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editContent.length} 字 · {selectedSubSection ? "小节" : "章节"}
                </p>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full min-h-[400px] bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
                  placeholder="在这里编辑内容..."
                />
              </div>
            </>
          )}
        </main>

        {/* 右侧：AI 面板 */}
        {showAiPanel && (
          <aside className="w-96 border-l border-gray-800 bg-gray-800/30 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-medium">🤖 AI 重写</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  输入重写要求
                </label>
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="例如：更专业一些、缩短到500字、改为正式语气..."
                  rows={3}
                />
                <button
                  onClick={handleAiRewrite}
                  disabled={isAiLoading || !aiInput.trim()}
                  className="w-full mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-medium"
                >
                  {isAiLoading ? "生成中..." : "生成新内容"}
                </button>
              </div>

              {aiResult && (
                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    生成结果
                  </label>
                  <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-300 max-h-60 overflow-y-auto">
                    {aiResult}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={applyAiResult}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium"
                    >
                      ✅ 应用
                    </button>
                    <button
                      onClick={() => setAiResult("")}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {isAiLoading && (
                <div className="text-center text-gray-500 py-4">
                  <div className="inline-block animate-spin mr-2">⏳</div>
                  AI 正在思考...
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
