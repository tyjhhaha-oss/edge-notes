import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST() {
  // 清除 auth_token Cookie
  const response = NextResponse.json({
    success: true,
    message: '已退出登录'
  })

  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // 立即过期
    path: '/',
  })

  return response
}