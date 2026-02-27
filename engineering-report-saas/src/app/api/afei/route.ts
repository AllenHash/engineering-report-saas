import { NextRequest, NextResponse } from 'next/server';

// 简单的消息转发到OpenClaw
// 这个API会把消息发送到阿飞

export async function POST(request: NextRequest) {
  try {
    const { message, sessionKey = 'main' } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    // 直接输出消息（开发调试用）
    console.log('[AgentPanel] 发送消息给阿飞:', message);

    // 这里实际上需要通过某种方式调用OpenClaw
    // 由于OpenClaw运行在另一个进程，我们用不同的方式
    
    // 方式1: 如果有sessions_send可用...
    // 方式2: 返回模拟响应（实际使用时替换为真实调用）
    
    // 返回预期格式
    return NextResponse.json({
      success: true,
      message: `消息已发送给阿飞: ${message}\n\n[实际使用时这里会调用OpenClaw的API]`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AgentPanel] Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// GET: 获取状态
export async function GET() {
  return NextResponse.json({
    status: 'running',
    connectedTo: 'OpenClaw',
    port: process.env.OPENCLAW_PORT || 18789,
    mode: 'Agent Panel API'
  });
}