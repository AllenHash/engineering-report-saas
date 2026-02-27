import { NextRequest, NextResponse } from "next/server";
import { extractInfoFromMessages, generateConfirmation, ExtractedInfo } from "@/lib/agent-utils";
import { getTemplateById } from "@/data/templates/outlines";

const API_KEY = process.env.SILICONFLOW_API_KEY || "sk-couqaakwgtkgrivhntvorigljarpuyvsmfedappuvlctloeg";
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
    console.log(`[Chat] Sending request to AI with ${messages.length} messages`);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${API_KEY}` 
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-8)],
        temperature: 0.7,
        max_tokens: 1536
      })
    });
    
    if (!response.ok) {
      console.error(`[Chat] API error: ${response.status} ${response.statusText}`);
      return "抱歉，AI服务暂时不可用。请稍后重试。";
    }
    
    const data = await response.json();
    console.log(`[Chat] Received response from AI`);
    
    return data.choices?.[0]?.message?.content || "抱歉，AI服务暂时不可用。";
  } catch (e) { 
    console.error("[Chat] Exception:", e);
    return "抱歉，网络连接问题，请检查您的网络稍后重试。"; 
  }
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
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "消息格式无效" }, { status: 400 });
    }

    // 调用AI获取回复
    const aiResponse = await callAI(messages);
    
    // 提取信息（简化逻辑，后续可以整合）
    const userMessage = messages[messages.length - 1]?.content || "";
    const extractedInfo: any = {};
    
    // 简单规则提取
    if (userMessage.includes("公路")) extractedInfo.projectType = "highway";
    else if (userMessage.includes("市政")) extractedInfo.projectType = "municipal";
    else if (userMessage.includes("生态")) extractedInfo.projectType = "ecology";
    
    if (userMessage.includes("成都")) extractedInfo.location = "四川省成都市";
    else if (userMessage.includes("北京")) extractedInfo.location = "北京市";
    else if (userMessage.includes("上海")) extractedInfo.location = "上海市";
    
    const nameMatch = userMessage.match(/(?:名字|名称)[为是]?([^，。,，]+)/);
    if (nameMatch) extractedInfo.projectName = nameMatch[1].trim();

    return NextResponse.json({ 
      message: aiResponse, 
      state: extractedInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ 
      message: "您好！我是工程可行性报告AI助手。\n\n我可以帮您编写：\n- 🛣️ 公路工程\n- 🏙️ 市政工程\n- 🌿 生态环境工程\n\n请告诉我您需要什么类型的报告？", 
      state: {},
      timestamp: new Date().toISOString()
    });
  }
}