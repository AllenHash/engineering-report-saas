import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));

    if (!token) {
      const cookieToken = request.cookies.get('auth_token')?.value;
      if (!cookieToken) {
        return NextResponse.json(
          { success: false, error: '未登录' },
          { status: 401 }
        );
      }
      var tokenToVerify = cookieToken;
    } else {
      var tokenToVerify = token;
    }

    const payload = verifyToken(tokenToVerify);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: '登录已过期' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // 验证输入
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: '用户名不能为空' },
        { status: 400 }
      );
    }

    if (name && name.length > 50) {
      return NextResponse.json(
        { success: false, error: '用户名不能超过50个字符' },
        { status: 400 }
      );
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: {
        nickname: name?.trim() || undefined
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        points: true
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.nickname,
        points: updatedUser.points
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}