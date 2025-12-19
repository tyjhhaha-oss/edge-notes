import { NextResponse } from 'next/server'

// 不需要鉴权的路径
const publicPaths = ['/', '/login', '/share', '/api/auth', '/note']

// 检查是否为公开路径
function isPublicPath(pathname) {
  return publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  )
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  // 如果是公开路径，直接放行
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // 检查 Cookie 中是否有 auth_token
  const authToken = request.cookies.get('auth_token')?.value

  if (!authToken) {
    // 如果没有 token，重定向到登录页
    const loginUrl = new URL('/login', request.url)
    // 添加重定向参数，登录后可以跳转回原页面
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 有 token，继续访问
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}