import { NextRequest, NextResponse } from "next/server";
import { extractInfoFromMessages, generateConfirmation, ExtractedInfo } from "@/lib/agent-utils";
import { getTemplateById } from "@/data/templates/outlines";

const API_KEY = process.env.SILICONFLOW_API_KEY || "sk-qqqmkuqspdfmtmdokzckygylkxktxgojlnqqadnxztenmtkh";
const API_URL = "https://api.siliconflow.cn/v1/chat/completions";

const SYSTEM_PROMPT = `你是工程可行性报告AI助手，帮助用户编写报告。

## 支持类型
- 公路工程、市政工程、生态环境工程

## 对话流程
1. 确认报告类型
2. 收集项目名称、建设地点
3. 用户确认后生成报告

直接回复，不需要JSON。`;

const projectInfoStore = new Map<string, ExtractedInfo>();

async function callAI(messages: any[]): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-8)],
        temperature: 0.7, max_tokens: 1536
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "抱歉，服务暂时不可用。";
  } catch (e) { return "抱歉，服务暂时不可用。"; }
}

// 生成单个章节
async function generateSection(section: any, info: any): Promise<string> {
  const prompt = `撰写报告章节"${section.title}"。
项目：${info.projectName || '待定'}
地点：${info.location || '待定'}
类型：${info.projectType || '待定'}
规模：${info.scale || '待定'}
投资：${info.investment || '待定'}

直接返回内容，不需要标题。`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [{ role: "system", content: "专业工程报告撰写" }, { role: "user", content: prompt }],
        temperature: 0.7, max_tokens: 1024
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "[生成中...]";
  } catch (e) { return "[生成失败]"; }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, action, sessionId } = body;
    const sid = sessionId || "default";

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    let projectInfo = projectInfoStore.get(sid) || {};
    const userMessage = messages[messages.length - 1].content;

    // 调用AI
    let aiResponse = await callAI(messages);

    // 提取信息
    const newInfo = await extractInfoFromMessages(messages);
    projectInfo = { ...projectInfo, ...newInfo };
    projectInfoStore.set(sid, projectInfo);

    // 生成报告
    if (action === "generate_report" || userMessage.includes("生成报告")) {
      if (!projectInfo.projectName || !projectInfo.location) {
        aiResponse = "请先告诉我项目名称和地点。";
      } else {
        const templateId = projectInfo.projectType === "highway" ? "highway-2023" : "gov-2023-standard";
        const template = getTemplateById(templateId);
        
        aiResponse = "正在生成报告...\n\n";
        const sections = [];
        
        for (const section of template?.sections?.slice(0, 3) || []) {
          const content = await generateSection(section, projectInfo);
          sections.push({ id: section.id, title: section.title, content });
        }

        const report = {
          id: `report_${Date.now()}`,
          title: `${projectInfo.projectName}可行性研究报告`,
          templateId, projectInfo, sections,
          createdAt: new Date().toISOString()
        };

        aiResponse += `✅ 报告已生成！包含 ${sections.length} 个章节。`;
        return NextResponse.json({ message: aiResponse, state: projectInfo, report });
      }
    } else if (Object.keys(newInfo).length > 0) {
      aiResponse += "\n\n" + generateConfirmation(newInfo);
    }

    return NextResponse.json({ message: aiResponse, state: projectInfo });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}