import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    // 验证密码（内部已包含用户查询）
    const user = await verifyPassword(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成token（转换createdAt为字符串以匹配UserPayload类型）
    const token = generateToken({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt.getTime()
    });

    return NextResponse.json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}