import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken, type UserPayload } from '@/lib/auth';
import { getUserById, getUserPoints } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    
    if (!token) {
      // 检查 cookie
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

    const user = await getUserById(payload.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 401 }
      );
    }

    const points = await getUserPoints(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.nickname,
        points
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
