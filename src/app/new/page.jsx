'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createNote } from '../actions'

export const runtime = 'edge'

export default function NewNotePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    console.log('🚀 [Client] Form submitted')

    setIsSubmitting(true)
    setError('')
    setDebugInfo(null)

    const formData = new FormData(e.target)
    console.log('🚀 [Client] FormData created, calling createNote...')

    try {
      const result = await createNote(formData)
      console.log('🚀 [Client] createNote returned:', result)

      // 检查是否成功
      if (result?.success) {
        // 创建成功，导航到首页
        router.push('/')
        return
      }

      if (result?.error) {
        setError(result.error)
        if (result.debug) {
          setDebugInfo(result.debug)
        }
      }
      // 如果成功，createNote 会重定向，所以这里不需要额外处理
    } catch (err) {
      setError(`创建笔记失败: ${err.message}`)
      setDebugInfo({ catchError: err.toString() })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-900 mr-4"
        >
          ← 返回
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">新建笔记</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {debugInfo && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <div className="font-bold mb-2">调试信息：</div>
          <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            标题
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入笔记标题"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            内容 (Markdown)
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={12}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入笔记内容，支持 Markdown 格式"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            name="is_public"
            value="true"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
            设为公开笔记（可分享）
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '创建中...' : '创建笔记'}
          </button>

          <Link
            href="/"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}