import { NextRequest, NextResponse } from 'next/server';

// 公开路径 - 不需要认证
const publicPaths = ['/login', '/register', '/api/auth', '/_next', '/favicon'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 允许公开路径
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 所有其他路径都允许访问，由客户端处理认证
  // 这样可以避免服务端中间件与cookie的问题
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
