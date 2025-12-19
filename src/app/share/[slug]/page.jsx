import Link from 'next/link'
import { getNoteBySlug } from '../../actions'

export const runtime = 'edge'

export default async function SharePage({ params }) {
  const { slug } = await params
  const result = await getNoteBySlug(slug)

  if (!result.success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">分享笔记</h1>
        </div>

        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          笔记不存在或已被删除
        </div>
      </div>
    )
  }

  const note = result.data

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">分享笔记</h1>
        </div>

        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          公开分享
        </div>
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
          <div className="text-sm text-gray-500">
            <p suppressHydrationWarning={true}>创建时间: {new Date(note.created_at).toLocaleString('zh-CN')}</p>
            <p className="mt-1">
              这是一个公开分享的笔记，任何人都可以通过此链接查看
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}