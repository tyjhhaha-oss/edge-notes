'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        // 登出成功，刷新页面回到登录状态
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('登出错误:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Edge Notes</h1>
      
      <div className="flex gap-3">
        <Link 
          href="/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新建笔记
        </Link>
        
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? '退出中...' : '退出登录'}
        </button>
      </div>
    </div>
  )
}