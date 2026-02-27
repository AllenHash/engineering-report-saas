import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword } from '@/lib/db';
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

    // 查找用户
    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    if (!verifyPassword(user, password)) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成token
    const token = generateToken(user);

    // 返回用户信息（不含密码）
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}