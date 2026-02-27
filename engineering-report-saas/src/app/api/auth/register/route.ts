import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { Prisma } from '@prisma/client';

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

    // 检查邮箱是否已存在
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 创建用户
    const user = await createUser({ email, nickname: name, password });

    // 生成token
    const token = generateToken({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt.getTime()
    });

    const response = NextResponse.json({
      success: true,
      token,
      user
    });

    // 将token存储在httpOnly cookie中
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('注册错误:', error);

    // 处理已存在的用户 (Prisma 错误)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: '该邮箱已被注册' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}