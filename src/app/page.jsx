import Link from 'next/link'
import { getNotesList } from './actions'
import Header from './components/Header'

// 禁用页面缓存，确保每次都获取最新数据
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function NotesList({ searchParams }) {
  const query = (await searchParams)?.query || ''
  const result = await getNotesList(query)

  if (!result.success) {
    return (
      <div className="p-4 text-red-600">
        加载笔记失败: {result.error}
      </div>
    )
  }

  const notes = result.data

  return (
    <div className="space-y-4">
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {query ? `没有找到包含"${query}"的笔记` : '还没有笔记，创建第一个吧！'}
        </div>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <Link href={`/note/${note.id}`}>
              <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                {note.title}
              </h3>
            </Link>
            <p className="text-gray-600 mt-2 line-clamp-2">
              {note.content.substring(0, 100)}
              {note.content.length > 100 ? '...' : ''}
            </p>
            <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
              <span suppressHydrationWarning={true}>
                {new Date(note.created_at).toLocaleDateString('zh-CN')}
              </span>
              {note.is_public && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  公开
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Header />

      <div className="mb-6">
        <form className="flex gap-2">
          <input
            type="text"
            name="query"
            placeholder="搜索笔记..."
            defaultValue={params?.query || ''}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            搜索
          </button>
        </form>
      </div>

      <NotesList searchParams={params} />
    </div>
  )
}