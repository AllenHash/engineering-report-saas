import { NextRequest, NextResponse } from "next/server";

// 模拟的简单回复（后续会接入真实的大模型API）
const simpleResponses: Record<string, string> = {
  highway: "好的，我将为公路工程编制可行性报告。\n\n请告诉我以下信息：\n1. 项目名称\n2. 建设地点（省市区）\n3. 道路等级（高速/一级/二级）\n4. 路线长度\n5. 项目总投资估算",
  municipal: "好的，我将为市政工程编制可行性报告。\n\n请告诉我以下信息：\n1. 项目名称\n2. 建设地点（省市区）\n3. 市政工程类型（道路/排水/供水/燃气）\n4. 建设规模\n5. 项目总投资估算",
  ecology: "好的，我将为生态环境工程编制可行性报告。\n\n请告诉我以下信息：\n1. 项目名称\n2. 建设地点（省市区）\n3. 生态修复类型（湿地/荒漠化/矿山）\n4. 修复面积\n5. 项目总投资估算",
};

function detectEngineType(message: string): string | null {
  const lower = message.toLowerCase();
  
  if (lower.includes("公路") || lower.includes("道路") || lower.includes("高速") || lower.includes("桥梁")) {
    return "highway";
  }
  if (lower.includes("市政") || lower.includes("排水") || lower.includes("供水") || lower.includes("燃气") || lower.includes("城市")) {
    return "municipal";
  }
  if (lower.includes("生态") || lower.includes("环境") || lower.includes("湿地") || lower.includes("修复") || lower.includes("绿化")) {
    return "ecology";
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || "";

    // 检测工程类型
    const engineType = detectEngineType(userMessage);

    let responseMessage = "";

    if (engineType && simpleResponses[engineType]) {
      responseMessage = simpleResponses[engineType];
    } else if (
      userMessage.includes("报告") ||
      userMessage.includes("写") ||
      userMessage.includes("可行性")
    ) {
      responseMessage = `好的，我可以帮你编写工程可行性报告。\n\n目前支持以下类型：\n- 🛣️ 公路工程\n- 🏙️ 市政工程\n- 🌿 生态环境工程\n\n请告诉我你需要编写哪种类型的报告，我会引导你完成。`;
    } else {
      responseMessage = "收到！请告诉我更多关于你的项目信息，比如：\n- 项目类型\n- 建设地点\n- 投资规模\n\n我需要了解这些信息才能帮助你完成可行性报告。";
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}