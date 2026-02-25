import { NextRequest, NextResponse } from "next/server";
import { getApiKey, API_URL } from "@/lib/api-utils";
import { extractInfoFromMessages, generateConfirmationMessage, ExtractedInfo } from "@/lib/agents/infoExtractor";
import { generateFullReport, SectionContent } from "@/lib/agents/contentGenerator";
import { getTemplateById } from "@/data/templates/outlines";

// 项目信息内存存储（后续应存数据库）
const projectInfoStore = new Map<string, ExtractedInfo>();

// 系统提示词
const SYSTEM_PROMPT = `你是工程可行性报告AI助手，专门帮助用户编写工程可行性报告。

## 你的角色
- 你是一个专业、友好的AI助手
- 通过对话引导用户完成可行性报告的编写
- 每次只问1-2个关键问题

## 支持的工程类型
1. 公路工程 - 道路、桥梁、隧道
2. 市政工程 - 排水、供水、燃气、管网
3. 生态环境工程 - 湿地修复、矿山修复、河道治理

## 对话流程
1. 首先确认用户需要的报告类型
2. 逐步收集关键信息：项目名称、建设地点、工程规模、投资估算
3. 信息收集足够后，询问是否开始生成报告
4. 用户确认后，生成完整报告

## 当前任务
帮助用户通过对话逐步完成工程可行性报告。`;

// 调用AI
async function callAI(messages: any[]): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getApiKey()}`
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10)
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (e) {
    console.error("AI error:", e);
    return "抱歉，服务暂时不可用。";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, action, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // 获取或初始化项目信息
    const sid = sessionId || "default";
    let projectInfo = projectInfoStore.get(sid) || {};
    
    // 1. 先调用AI处理对话
    const userMessage = messages[messages.length - 1].content;
    let aiResponse = await callAI(messages);
    
    // 2. 提取/更新项目信息
    const newInfo = await extractInfoFromMessages(messages);
    projectInfo = { ...projectInfo, ...newInfo };
    projectInfoStore.set(sid, projectInfo);
    
    // 3. 如果用户确认生成报告
    if (action === "generate_report" || userMessage.includes("生成报告") || userMessage.includes("开始写")) {
      if (!projectInfo.projectName || !projectInfo.location || !projectInfo.projectType) {
        aiResponse = "请先告诉我项目的基本信息（名称、地点、类型），我再帮你生成报告。";
      } else {
        // 确定模板ID
        const templateIdMap: Record<string, string> = {
          highway: "highway-2023",
          municipal: "municipal",
          ecology: "ecology",
          water: "water",
          building: "building",
          general: "gov-2023-standard"
        };
        const templateId = templateIdMap[projectInfo.projectType] || "gov-2023-standard";
        
        aiResponse = "好的，正在为你生成完整的可行性报告，这可能需要一些时间...\n\n";
        
        // 生成报告
        const sections = await generateFullReport(
          {
            name: projectInfo.projectName,
            location: projectInfo.location,
            type: projectInfo.projectType,
            scale: projectInfo.scale || "",
            investment: projectInfo.investment || ""
          },
          templateId
        );
        
        // 整合报告
        const report = {
          id: `report_${Date.now()}`,
          title: `${projectInfo.projectName}可行性研究报告`,
          templateId,
          projectInfo,
          sections,
          createdAt: new Date().toISOString()
        };
        
        aiResponse += "✅ 报告已生成完成！你可以在右侧预览完整内容。\n\n";
        aiResponse += `📋 报告包含 ${sections.length} 个章节，共 ${sections.reduce((acc, s) => acc + s.content.length, 0)} 字。`;
        
        return NextResponse.json({ 
          message: aiResponse, 
          state: projectInfo,
          report: report
        });
      }
    } else if (Object.keys(newInfo).length > 0) {
      // 如果提取到了新信息，追加确认
      const confirmMsg = generateConfirmationMessage(newInfo);
      aiResponse += "\n\n" + confirmMsg;
    }

    return NextResponse.json({ 
      message: aiResponse, 
      state: projectInfo 
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}