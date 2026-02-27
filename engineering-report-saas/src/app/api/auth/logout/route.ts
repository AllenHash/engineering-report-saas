import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // 清除 cookie
  response.cookies.delete('auth_token');

  return response;
}
