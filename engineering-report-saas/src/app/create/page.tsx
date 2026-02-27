"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProjectInfo {
  name: string;
  location: string;
  type: string;
  scale: string;
  investment: string;
  description: string;
}

// 二级目录（章节小节）
interface SubSection {
  id: string;
  title: string;
  description: string;
  confirmed: boolean;
}

// 一级目录（章节）
interface OutlineLevel {
  id: string;
  title: string;
  centerThought: string;
  confirmed: boolean;
  children?: SubSection[];
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  action?: string | null;
}

// 工程类型选项
const PROJECT_TYPES = [
  { id: "highway", name: "公路工程", icon: "🛣️" },
  { id: "municipal", name: "市政工程", icon: "🏙️" },
  { id: "environmental", name: "生态环境工程", icon: "🌿" },
  { id: "water", name: "水利工程", icon: "💧" },
  { id: "building", name: "建筑工程", icon: "🏗️" },
  { id: "railway", name: "铁路工程", icon: "🚄" },
];

// 默认大纲（带二级目录）
const DEFAULT_OUTLINE: OutlineLevel[] = [
  { 
    id: "1", 
    title: "一、概述", 
    centerThought: "报告概述、项目基本信息、结论与建议", 
    confirmed: false,
    children: [
      { id: "1.1", title: "（一）项目概况", description: "项目全称及简称，概述项目建设目标和任务", confirmed: false },
      { id: "1.2", title: "（二）项目单位概况", description: "简述项目单位基本情况", confirmed: false },
      { id: "1.3", title: "（三）编制依据", description: "项目建议书及其批复文件、国家和地方有关支持性规划", confirmed: false },
      { id: "1.4", title: "（四）主要结论和建议", description: "简述项目可行性研究的主要结论和建议", confirmed: false },
    ]
  },
  { 
    id: "2", 
    title: "二、项目建设背景和必要性", 
    centerThought: "区域发展需求、项目建设的意义", 
    confirmed: false,
    children: [
      { id: "2.1", title: "（一）项目建设背景", description: "简述项目立项背景", confirmed: false },
      { id: "2.2", title: "（二）规划政策符合性", description: "阐述项目与重大规划的衔接性", confirmed: false },
      { id: "2.3", title: "（三）项目建设必要性", description: "综合论证项目建设的必要性和建设时机的适当性", confirmed: false },
    ]
  },
  { 
    id: "3", 
    title: "三、项目需求分析与产出方案", 
    centerThought: "市场需求分析、建设内容和规模", 
    confirmed: false,
    children: [
      { id: "3.1", title: "（一）需求分析", description: "调查产品或服务需求现状", confirmed: false },
      { id: "3.2", title: "（二）建设内容和规模", description: "论证拟建项目的总体布局、主要建设内容", confirmed: false },
      { id: "3.3", title: "（三）项目产出方案", description: "提出正常运营年份应达到的生产或服务能力", confirmed: false },
    ]
  },
  { 
    id: "4", 
    title: "四、项目选址与要素保障", 
    centerThought: "地理位置、自然条件、选址比较", 
    confirmed: false,
    children: [
      { id: "4.1", title: "（一）项目选址或选线", description: "通过多方案比较，选择最佳场址或线路方案", confirmed: false },
      { id: "4.2", title: "（二）项目建设条件", description: "分析自然环境、交通运输、公用工程等建设条件", confirmed: false },
      { id: "4.3", title: "（三）要素保障分析", description: "分析土地要素保障条件", confirmed: false },
    ]
  },
  { 
    id: "5", 
    title: "五、项目建设方案", 
    centerThought: "技术方案、设计标准、工程规模", 
    confirmed: false,
    children: [
      { id: "5.1", title: "（一）技术方案", description: "通过技术比较提出项目预期达到的技术目标", confirmed: false },
      { id: "5.2", title: "（二）设备方案", description: "通过设备比选提出所需主要设备", confirmed: false },
      { id: "5.3", title: "（三）工程方案", description: "通过方案比选提出工程建设标准", confirmed: false },
    ]
  },
  { 
    id: "6", 
    title: "六、投资估算与资金筹措", 
    centerThought: "总投资估算、资金来源", 
    confirmed: false,
    children: [
      { id: "6.1", title: "（一）投资估算", description: "说明投资估算依据和主要投资指标", confirmed: false },
      { id: "6.2", title: "（二）资金筹措", description: "提出项目建设资金来源渠道和筹措方式", confirmed: false },
    ]
  },
  { 
    id: "7", 
    title: "七、财务评价", 
    centerThought: "盈利能力分析、财务生存能力", 
    confirmed: false,
    children: [
      { id: "7.1", title: "（一）财务评价依据", description: "说明财务评价依据和主要参数", confirmed: false },
      { id: "7.2", title: "（二）财务分析", description: "分析项目盈利能力、偿债能力和财务生存能力", confirmed: false },
      { id: "7.3", title: "（三）不确定性分析", description: "进行盈亏平衡分析和敏感性分析", confirmed: false },
    ]
  },
  { 
    id: "8", 
    title: "八、社会评价", 
    centerThought: "社会效益分析、公众意见", 
    confirmed: false,
    children: [
      { id: "8.1", title: "（一）社会影响分析", description: "分析项目对当地社会的影响", confirmed: false },
      { id: "8.2", title: "（二）互适性分析", description: "分析当地社会环境对项目的适应程度", confirmed: false },
      { id: "8.3", title: "（三）社会风险分析", description: "识别项目潜在社会风险", confirmed: false },
    ]
  },
];

export default function CreatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "你好！我是工程报告AI助手 📋\n\n请告诉我你想写什么类型的可行性报告？\n\n比如：\"我想写一个高速公路项目\" 或 \"帮我生成一个市政道路的可研报告\"",
      timestamp: new Date(),
      action: "input_name",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: "",
    location: "",
    type: "",
    scale: "",
    investment: "",
    description: "",
  });
  const [outline, setOutline] = useState<OutlineLevel[]>(DEFAULT_OUTLINE);
  const [currentPhase, setCurrentPhase] = useState<string>("name");
  const [currentOutlineIndex, setCurrentOutlineIndex] = useState(0); // 当前确认到第几章
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 重定向未登录用户
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "user" | "assistant" | "system", content: string, action: string | null = null) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date(),
        action,
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    addMessage("user", userInput);
    setInput("");
    setIsLoading(true);

    try {
      // 阶段1: 项目名称
      if (currentPhase === "name") {
        setProjectInfo((prev) => ({ ...prev, name: userInput }));
        addMessage(
          "assistant",
          `好的，项目名称是"${userInput}"。\n\n请问这是什么类型的工程？\n\n${PROJECT_TYPES.map((t) => `${t.icon} ${t.name}`).join("  ")}`,
          "input_type"
        );
        setCurrentPhase("type");
      } 
      // 阶段2: 工程类型
      else if (currentPhase === "type") {
        const selectedType = PROJECT_TYPES.find(
          (t) => t.id === userInput || t.name.includes(userInput) || userInput.includes(t.name)
        );
        if (selectedType) {
          setProjectInfo((prev) => ({ ...prev, type: selectedType.id }));
          addMessage(
            "assistant",
            `明白了，${selectedType.icon} ${selectedType.name}。\n\n请告诉我项目的建设地点在哪里？`,
            "input_location"
          );
          setCurrentPhase("details");
        } else {
          addMessage(
            "assistant",
            "抱歉，我没有识别到工程类型。请告诉我：\n\n🛣️ 公路  🏙️ 市政  🌿 生态  💧 水利  🏗️ 建筑  🚄 铁路",
            "input_type"
          );
        }
      }
      // 阶段3: 详细信息
      else if (currentPhase === "details") {
        if (!projectInfo.location) {
          setProjectInfo((prev) => ({ ...prev, location: userInput }));
          addMessage(
            "assistant",
            "好的，请问建设规模是什么？\n\n比如：\"双向4车道，全长20公里\" 或 \"占地500亩\"",
            "input_scale"
          );
        } else if (!projectInfo.scale) {
          setProjectInfo((prev) => ({ ...prev, scale: userInput }));
          addMessage(
            "assistant",
            "好的，请问估算投资是多少？\n\n比如：\"5亿元\" 或 \"总投资约10亿元\"",
            "input_investment"
          );
        } else if (!projectInfo.investment) {
          setProjectInfo((prev) => ({ ...prev, investment: userInput }));
          // 汇总信息，进入一级目录确认
          const typeName = PROJECT_TYPES.find((t) => t.id === projectInfo.type)?.name;
          addMessage(
            "assistant",
            `好的，信息收集完毕！\n\n📋 项目名称：${projectInfo.name}\n🏗️ 工程类型：${typeName}\n📍 建设地点：${projectInfo.location}\n📏 建设规模：${projectInfo.scale}\n💰 估算投资：${projectInfo.investment}\n\n现在开始确认报告大纲。\n\n${outline[0].title}：${outline[0].centerThought}\n\n请说"确认"进入下一章，或说"修改"提出调整。`,
            "confirm_outline"
          );
          setCurrentPhase("outline");
          setCurrentOutlineIndex(0);
        } else {
          addMessage(
            "assistant",
            "好的，还有其他想补充的吗？如果没有了，请说\"确认\"或\"可以了\"。",
            "input_details"
          );
        }
      }
      // 阶段4: 一级目录确认
      else if (currentPhase === "outline") {
        if (userInput.includes("确认") || userInput.includes("好") || userInput.includes("可以")) {
          // 确认当前章，进入下一章
          const nextIndex = currentOutlineIndex + 1;
          if (nextIndex < outline.length) {
            setCurrentOutlineIndex(nextIndex);
            addMessage(
              "assistant",
              `✅ ${outline[currentOutlineIndex].title} 已确认！\n\n${outline[nextIndex].title}：${outline[nextIndex].centerThought}\n\n请说"确认"进入下一章，或说"修改"调整本章内容。`,
              "confirm_outline"
            );
          } else {
            // 一级目录全部确认完毕，进入二级目录确认
            setCurrentPhase("sub_outline");
            setCurrentOutlineIndex(0);
            addMessage(
              "assistant",
              `✅ 一级目录全部确认完毕！\n\n现在开始确认二级目录（章节小节）。\n\n${outline[0].title} 的小节：\n\n${outline[0].children?.map((c, i) => `${c.id} ${c.title}`).join("\n")}\n\n请说"确认"继续，或说"修改"调整。`,
              "confirm_sub_outline"
            );
          }
        } else {
          addMessage(
            "assistant",
            `好的，我听到了你的意见：${userInput}\n\n当前确认：${outline[currentOutlineIndex].title}\n\n请说"确认"进入下一章，或继续告诉我你想如何修改。`,
            "confirm_outline"
          );
        }
      }
      // 阶段5: 二级目录确认
      else if (currentPhase === "sub_outline") {
        if (userInput.includes("确认") || userInput.includes("好") || userInput.includes("可以")) {
          const nextIndex = currentOutlineIndex + 1;
          if (nextIndex < outline.length) {
            setCurrentOutlineIndex(nextIndex);
            addMessage(
              "assistant",
                `✅ ${outline[currentOutlineIndex].title} 的小节已确认！\n\n${outline[nextIndex].title} 的小节：\n\n${outline[nextIndex].children?.map((c) => `${c.id} ${c.title}`).join("\n")}\n\n请说"确认"继续。`,
              "confirm_sub_outline"
            );
          } else {
            // 二级目录全部确认完毕，准备生成
            setCurrentPhase("generating");
            addMessage(
              "assistant",
              `✅ 二级目录全部确认完毕！\n\n📋 报告大纲确认完成：\n- 一级目录：${outline.length} 章\n- 二级目录：${outline.reduce((acc, ch) => acc + (ch.children?.length || 0), 0)} 节\n\n现在生成报告，请稍候...`,
              "generating"
            );
            await generateReport();
          }
        } else {
          addMessage(
            "assistant",
            `好的，我听到了：${userInput}\n\n${outline[currentOutlineIndex].title} 的小节：\n${outline[currentOutlineIndex].children?.map((c) => `${c.id} ${c.title}`).join("\n")}\n\n请说"确认"继续，或继续说明想如何修改。`,
            "confirm_sub_outline"
          );
        }
      }
      else {
        // 调用 AI 进行智能对话
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userInput,
            projectInfo,
            phase: currentPhase,
          }),
        });
        const data = await response.json();
        if (data.success && data.response) {
          addMessage("assistant", data.response);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      addMessage("assistant", "抱歉，出错了。请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    handleSend();
  };

  const generateReport = async () => {
    setIsLoading(true);

    try {
      const templateIdMap: Record<string, string> = {
        highway: "gov-2023-standard",
        municipal: "gov-2023-standard",
        environmental: "gov-2023-standard",
        water: "gov-2023-standard",
        building: "gov-2023-standard",
        railway: "gov-2023-standard",
      };
      const templateId = templateIdMap[projectInfo.type] || "gov-2023-standard";

      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectInfo,
          templateId,
          sections: outline.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            description: chapter.centerThought,
            children: chapter.children?.map((child) => ({
              id: child.id,
              title: child.title,
              description: child.description,
            })),
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage(
          "assistant",
          `✅ 报告生成完成！\n\n现在带你去看生成的报告...`
        );
        setTimeout(() => {
          router.push(`/reports?id=${data.report?.id || data.reportId}`);
        }, 1500);
      } else {
        addMessage("assistant", `生成失败：${data.error || "请稍后重试"}`);
        setCurrentPhase("sub_outline");
      }
    } catch (err) {
      console.error("Generate error:", err);
      addMessage("assistant", "生成报告时出错，请稍后重试。");
      setCurrentPhase("sub_outline");
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前阶段显示
  const getPhaseLabel = () => {
    const phases = [
      { key: "name", label: "① 项目名称" },
      { key: "type", label: "② 工程类型" },
      { key: "details", label: "③ 项目详情" },
      { key: "outline", label: "④ 一级目录" },
      { key: "sub_outline", label: "⑤ 二级目录" },
      { key: "generating", label: "⑥ 生成报告" },
    ];
    return phases.find((p) => p.key === currentPhase)?.label || "";
  };

  // 快捷回复按钮
  const QuickReplies = () => {
    if (currentPhase === "type") {
      return (
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleQuickReply(t.name)}
              className="px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors"
            >
              {t.icon} {t.name}
            </button>
          ))}
        </div>
      );
    }
    if (currentPhase === "outline" || currentPhase === "sub_outline") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleQuickReply("确认")}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
          >
            ✅ 确认
          </button>
          <button
            onClick={() => handleQuickReply("修改")}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
          >
            📝 修改
          </button>
        </div>
      );
    }
    return null;
  };

  if (authLoading) {
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
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span className="font-medium">创建报告</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <a href="/reports" className="hover:text-white">历史报告</a>
            <a href="/templates" className="hover:text-white">模板库</a>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start"}`}
            >
              {msg.role === "system" ? (
                <div className="text-gray-500 text-sm py-2">
                  {msg.content}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-800 text-gray-100 rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              )}
            </div>
          ))}
          
          {/* Quick Replies */}
          {QuickReplies() && !isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                {QuickReplies()}
              </div>
            </div>
          )}

          {isLoading && currentPhase !== "generating" && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                currentPhase === "name"
                  ? "例如：成灌高速公路建设工程..."
                  : currentPhase === "type"
                  ? "选择或输入工程类型..."
                  : currentPhase === "details"
                  ? "告诉我更多项目信息..."
                  : currentPhase === "outline"
                  ? "确认或修改目录..."
                  : currentPhase === "sub_outline"
                  ? "确认或修改小节..."
                  : "输入你的想法..."
              }
              className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-500 overflow-x-auto">
            <span className={`px-2 py-0.5 rounded whitespace-nowrap ${currentPhase === "name" ? "bg-blue-600 text-white" : "bg-gray-800"}`}>① 名称</span>
            <span className="text-gray-600">→</span>
            <span className={`px-2 py-0.5 rounded whitespace-nowrap ${currentPhase === "type" ? "bg-blue-600 text-white" : "bg-gray-800"}`}>② 类型</span>
            <span className="text-gray-600">→</span>
            <span className={`px-2 py-0.5 rounded whitespace-nowrap ${currentPhase === "details" ? "bg-blue-600 text-white" : "bg-gray-800"}`}>③ 详情</span>
            <span className="text-gray-600">→</span>
            <span className={`px-2 py-0.5 rounded whitespace-nowrap ${currentPhase === "outline" ? "bg-blue-600 text-white" : "bg-gray-800"}`}>④ 一级</span>
            <span className="text-gray-600">→</span>
            <span className={`px-2 py-0.5 rounded whitespace-nowrap ${currentPhase === "sub_outline" ? "bg-blue-600 text-white" : "bg-gray-800"}`}>⑤ 二级</span>
            <span className="text-gray-600">→</span>
            <span className={`px-2 py-0.5 rounded whitespace-nowrap ${currentPhase === "generating" ? "bg-green-600 text-white" : "bg-gray-800"}`}>⑥ 生成</span>
          </div>
        </div>
      </div>
    </div>
  );
}
