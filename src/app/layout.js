import './globals.css'

export const metadata = {
  title: 'Edge Notes - 极简笔记应用',
  description: '基于 Next.js + Cloudflare D1 的极简笔记应用，支持 Markdown 和分享功能',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
