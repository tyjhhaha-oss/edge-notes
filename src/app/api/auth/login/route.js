import { NextResponse } from 'next/server'

export const runtime = 'edge'

// 管理员密码
const ADMIN_PASSWORD = 'admin123'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: '密码不能为空' },
        { status: 400 }
      )
    }

    // 验证密码
    if (password === ADMIN_PASSWORD) {
      // 密码正确，设置 Cookie
      const response = NextResponse.json({
        success: true,
        message: '登录成功'
      })

      // 设置 auth_token Cookie，有效期 7 天
      response.cookies.set('auth_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 天
        path: '/',
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}