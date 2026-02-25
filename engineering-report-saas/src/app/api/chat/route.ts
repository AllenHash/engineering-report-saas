import { NextRequest, NextResponse } from "next/server";
import { getOutline, exportOutlineToMarkdown, getOutlineList } from "@/data/outlines";

// 硅基流动API配置
const getApiKey = () => process.env.SILICONFLOW_API_KEY || "sk-qqqmkuqspdfmtmdokzckygylkxktxgojlnqqadnxztenmtkh";
const API_URL = "https://api.siliconflow.cn/v1/chat/completions";

// 模型配置
const MODELS = {
  primary: "mx-T2-2002203042",
  deepseek: "deepseek-ai/DeepSeek-V3",
  glm: "THUglm/GLM-4-9B-Chat",
  qwen: "Qwen/Qwen2.5-7B-Instruct"
};

const MODEL_LIST = [
  { key: "primary", name: "MiniMax 2.5", model: MODELS.primary },
  { key: "deepseek", name: "DeepSeek V3", model: MODELS.deepseek },
  { key: "glm", name: "GLM-5", model: MODELS.glm },
  { key: "qwen", name: "Qwen 3.5", model: MODELS.qwen }
];

// 项目信息收集状态（内存中存储，实际应存数据库）
const projectStates = new Map<string, {
  type: string | null;
  name: string | null;
  location: string | null;
  scale: string | null;
  investment: string | null;
}>();

function getProjectState(sessionId: string) {
  if (!projectStates.has(sessionId)) {
    projectStates.set(sessionId, {
      type: null,
      name: null,
      location: null,
      scale: null,
      investment: null
    });
  }
  return projectStates.get(sessionId)!;
}

// 系统提示词
const getSystemPrompt = (sessionId: string) => {
  const state = getProjectState(sessionId);
  
  const outlineList = getOutlineList().map(o => `- ${o.name}: ${o.type}`).join("\n");
  
  let prompt = `你是工程可行性报告AI助手，专门帮助用户编写工程可行性报告。

## 你的角色
- 你是一个专业、友好的AI助手
- 通过对话引导用户完成可行性报告的编写
- 每次只问1-2个关键问题，不要一次问太多

## 支持的工程类型
1. 公路工程 (highway) - 道路、桥梁、隧道、立交等
2. 市政工程 (municipal) - 排水、供水、燃气、供热、管网等
3. 生态环境工程 (ecology) - 湿地修复、矿山修复、河道治理等

## 对话流程
1. 首先确认用户需要的报告类型
2. 逐步收集关键信息：项目名称、建设地点、工程规模、投资估算等
3. 当收集到"项目名称 + 建设地点 + 工程类型"后，告诉用户将使用标准大纲
4. 可以展示大纲结构并询问用户是否有需要调整的部分
5. 根据用户确认的大纲，逐一填充各章节内容

## 内置大纲
系统已内置国家标准大纲（国家发改委2023年版），包括：
${outlineList}

## 当前收集状态
${state.type ? `- 工程类型: ${state.type}` : "- 工程类型: 未确定"}
${state.name ? `- 项目名称: ${state.name}` : "- 项目名称: 未提供"}
${state.location ? `- 建设地点: ${state.location}` : "- 建设地点: 未提供"}
${state.scale ? `- 建设规模: ${state.scale}` : "- 建设规模: 未提供"}
${state.investment ? `- 投资估算: ${state.investment}` : "- 投资估算: 未提供"}

## 重要原则
- 用户已经提供的信息不要重复询问
- 根据用户提供的话提取有用信息并更新状态
- 对话要自然流畅，像人与人聊天
- 每次回复简洁，不超过200字
- 使用中文交流
- 当收集到足够信息后，展示对应的大纲给用户确认

当前任务：帮助用户通过对话逐步完成工程可行性报告。`;

  return prompt;
};

// 从用户消息中提取信息
function extractInfo(message: string, currentState: any): any {
  const newState = { ...currentState };
  const lower = message.toLowerCase();
  
  // 检测工程类型
  if (!newState.type) {
    if (lower.includes("公路") || lower.includes("道路") || lower.includes("高速") || lower.includes("桥梁") || lower.includes("隧道")) {
      newState.type = "highway";
    } else if (lower.includes("市政") || lower.includes("排水") || lower.includes("供水") || lower.includes("燃气")) {
      newState.type = "municipal";
    } else if (lower.includes("生态") || lower.includes("环境") || lower.includes("湿地") || lower.includes("修复") || lower.includes("矿山") || lower.includes("河道")) {
      newState.type = "ecology";
    }
  }
  
  // 提取项目名称（简单匹配）
  const namePatterns = [
    /(?:名称|叫|名为|项目|工程)(?:是|叫|为)?([^，。,，]+)/i,
    /"([^"]+)"/,
    /「([^」]+)」/
  ];
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && !newState.name) {
      newState.name = match[1].trim().slice(0, 50);
      break;
    }
  }
  
  // 提取地点
  const locationPatterns = [
    /((?:北京|上海|天津|重庆)|(?:[江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|河北|山西|辽宁|吉林|黑龙江)省?)(?:省|市|县|[自治区])?/g,
    /((?:成都|武汉|长沙|南昌|合肥|杭州|南京|广州|深圳|西安|郑州|济南|青岛|福州|厦门|昆明|贵阳|南宁|石家庄|太原|哈尔滨|长春|沈阳))/g
  ];
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && !newState.location) {
      newState.location = match[0];
      break;
    }
  }
  
  // 提取规模（数字+单位）
  const scaleMatch = message.match(/(\d+(?:\.\d+)?)\s*(公里|千米|米|万平方米|亩|公顷|米\/秒|车道)/i);
  if (scaleMatch && !newState.scale) {
    newState.scale = scaleMatch[0];
  }
  
  // 提取投资
  const investMatch = message.match(/(\d+(?:\.\d+)?)\s*(亿|万|元|k|千)/i);
  if (investMatch && !newState.investment) {
    newState.investment = investMatch[0];
    if (!newState.investment.includes("亿") && !newState.investment.includes("万")) {
      newState.investment += "元";
    }
  }
  
  return newState;
}

// 调用AI
async function callAI(messages: { role: string; content: string }[], sessionId: string): Promise<string> {
  const apiKey = getApiKey();

  for (const modelInfo of MODEL_LIST) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelInfo.model,
          messages: [
            { role: "system", content: getSystemPrompt(sessionId) },
            ...messages.slice(-10)
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) return content;
    } catch (error) {
      console.error(`[AI] ${modelInfo.name} error:`, error);
      continue;
    }
  }

  return "抱歉，AI服务暂时不可用，请稍后再试。";
}

// 判断是否需要展示大纲
function shouldShowOutline(state: any): boolean {
  return !!(state.type && state.name && state.location);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // 使用sessionId或随机ID
    const sid = sessionId || "default";
    
    // 更新项目状态
    const lastMessage = messages[messages.length - 1]?.content || "";
    const currentState = getProjectState(sid);
    const newState = extractInfo(lastMessage, currentState);
    projectStates.set(sid, newState);
    
    // 检查是否需要展示大纲
    if (shouldShowOutline(newState) && !shouldShowOutline(currentState)) {
      // 刚收集到足够信息，生成大纲
      const outline = getOutline(newState.type!);
      const outlineMd = exportOutlineToMarkdown(outline);
      
      const response = await callAI(messages, sid);
      
      // 附加大纲信息
      const finalResponse = `${response}\n\n---\n📋 已为你加载《${outline.name}》：\n\n${outlineMd}\n\n请确认这份大纲是否适合你的项目，如有需要调整的部分请告诉我。`;
      
      return NextResponse.json({ message: finalResponse, state: newState });
    }

    // 正常对话
    const responseMessage = await callAI(messages, sid);

    return NextResponse.json({ message: responseMessage, state: newState });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}