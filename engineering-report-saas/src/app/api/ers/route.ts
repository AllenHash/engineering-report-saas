// ERS API路由 - 工程可行性报告智能生成系统
// 此API已被 /api/chat 和 /api/reports/generate 替代
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "请使用 /api/chat 进行对话，或 /api/reports/generate 生成报告"
  });
}

export async function GET() {
  return NextResponse.json({
    message: "ERS API",
    endpoints: {
      chat: "/api/chat",
      generate: "/api/reports/generate"
    }
  });
}
