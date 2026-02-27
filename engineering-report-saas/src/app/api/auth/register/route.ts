import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // 验证必填字段
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: '请填写邮箱、用户名和密码' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少6位' },
        { status: 400 }
      );
    }

    // 创建用户
    const user = createUser({ email, name, password });

    // 生成token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    });

    return NextResponse.json({
      success: true,
      token,
      user
    });

  } catch (error: any) {
    console.error('注册错误:', error);

    // 处理已存在的用户
    if (error.message?.includes('邮箱已被注册')) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}