import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getNoteById } from '../../actions'
import ShareLink from '../../components/ShareLink'

export const runtime = 'edge'

export default async function NoteDetailPage({ params }) {
  const { id } = await params
  const result = await getNoteById(id)

  if (!result.success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            ← 返回
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">笔记详情</h1>
        </div>

        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {result.error}
        </div>
      </div>
    )
  }

  const note = result.data

  // 🔒 安全检查：如果笔记是私有的，必须登录才能访问
  if (!note.is_public) {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')

    if (!authToken) {
      // 未登录用户尝试访问私有笔记，重定向到登录页
      redirect(`/login?redirect=/note/${id}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            ← 返回
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">笔记详情</h1>
        </div>

        {note.is_public && (
          <div className="flex flex-col items-end">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
              公开笔记
            </div>
            {/* 传递 slug 给客户端组件生成链接 */}
            <ShareLink slug={note.slug} />
          </div>
        )}
        {!note.is_public && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            私有笔记
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {note.title}
        </h2>

        <div className="prose max-w-none mb-6">
          <pre className="whitespace-pre-wrap font-sans text-gray-700">
            {note.content}
          </pre>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span suppressHydrationWarning={true}>
              创建时间: {new Date(note.created_at).toLocaleString('zh-CN')}
            </span>

            {note.is_public && note.slug && (
              <div className="text-right">
                <p className="font-medium text-gray-700">分享链接:</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">
                  /share/{note.slug}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}