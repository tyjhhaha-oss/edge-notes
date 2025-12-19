'use server'

import { nanoid } from 'nanoid'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getRequestContext } from '@cloudflare/next-on-pages'

// ===== 数据库抽象层 =====
// 支持开发环境（模拟数据）和生产环境（Cloudflare D1）

// 初始化模拟数据（仅用于开发环境）
if (!globalThis.mockNotes) {
  globalThis.mockNotes = [
    {
      id: 1,
      title: '欢迎使用 Edge Notes',
      content: '这是一个示例笔记，用于演示应用程序功能。',
      is_public: 1,
      slug: 'welcome',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: '开发环境说明',
      content: '在开发环境中，我们使用模拟数据来测试应用功能。部署到Cloudflare后会自动切换到D1数据库。',
      is_public: 0,
      slug: null,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]
}

// 获取数据库连接
function getDB() {
  // 在Cloudflare Pages环境中，尝试多种方式获取D1实例

  // 方法1: 尝试从request context获取
  try {
    const requestContext = getRequestContext()
    if (requestContext?.env?.DB) {
      console.log('✅ 使用 Cloudflare D1 数据库 (via getRequestContext)')
      return requestContext.env.DB
    }
  } catch (e) {
    // 在开发环境或某些情况下会失败
  }

  // 方法2: 检查process.env (某些Cloudflare环境)
  if (typeof process !== 'undefined' && process.env?.DB) {
    console.log('✅ 使用 Cloudflare D1 数据库 (via process.env)')
    return process.env.DB
  }

  // 方法3: 检查globalThis (Cloudflare Workers环境)
  if (typeof globalThis !== 'undefined' && globalThis.DB) {
    console.log('✅ 使用 Cloudflare D1 数据库 (via globalThis)')
    return globalThis.DB
  }

  // 开发环境：使用模拟数据库
  console.log('📝 使用模拟数据库（开发环境）')
  const mockNotes = globalThis.mockNotes

  return {
    prepare: (sql) => ({
      bind: (...params) => ({
        first: async () => {
          if (sql.includes('SELECT id FROM notes WHERE slug = ?')) {
            return mockNotes.find(note => note.slug === params[0]) || null
          }
          if (sql.includes('SELECT * FROM notes WHERE id = ?')) {
            return mockNotes.find(note => note.id === parseInt(params[0])) || null
          }
          if (sql.includes('SELECT slug FROM notes WHERE slug = ?')) {
            return mockNotes.find(note => note.slug === params[0]) || null
          }
          if (sql.includes('WHERE id = ?')) {
            return mockNotes.find(note => note.id === parseInt(params[0])) || null
          }
          return null
        },
        all: async () => {
          let results = [...mockNotes]

          if (sql.includes('WHERE slug = ?')) {
            results = results.filter(note => note.slug === params[0])
          }
          if (sql.includes('WHERE id = ?')) {
            results = results.filter(note => note.id === parseInt(params[0]))
          }
          if (sql.includes('WHERE is_public = 1')) {
            results = results.filter(note => note.is_public === 1)
          }
          if (sql.includes('LIKE ?')) {
            const searchTerm = params[0].replace(/%/g, '').toLowerCase()
            results = results.filter(note =>
              note.title.toLowerCase().includes(searchTerm) ||
              note.content.toLowerCase().includes(searchTerm)
            )
          }
          if (sql.includes('ORDER BY created_at DESC')) {
            results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          }

          return { results }
        },
        run: async () => {
          if (sql.includes('INSERT INTO notes')) {
            const newId = Math.max(...mockNotes.map(n => n.id), 0) + 1
            const newNote = {
              id: newId,
              title: params[0],
              content: params[1],
              is_public: params[2],
              slug: params[3],
              created_at: new Date().toISOString()
            }
            mockNotes.push(newNote)
            console.log(`✅ 新笔记已添加 ID:${newId}, 当前笔记总数: ${mockNotes.length}`)
            return { success: true, meta: { last_row_id: newId } }
          }
          if (sql.includes('UPDATE notes')) {
            const noteId = parseInt(params[3])
            const noteIndex = mockNotes.findIndex(n => n.id === noteId)
            if (noteIndex !== -1) {
              mockNotes[noteIndex] = {
                ...mockNotes[noteIndex],
                title: params[0],
                content: params[1],
                is_public: params[2],
                slug: params[4] !== undefined ? params[4] : mockNotes[noteIndex].slug
              }
            }
            return { success: true }
          }
          if (sql.includes('DELETE FROM notes')) {
            const noteId = parseInt(params[0])
            const noteIndex = mockNotes.findIndex(n => n.id === noteId)
            if (noteIndex !== -1) {
              mockNotes.splice(noteIndex, 1)
            }
            return { success: true }
          }
          return { success: true }
        }
      })
    })
  }
}

// ===== Server Actions =====

// 创建笔记
export async function createNote(formData) {
  try {
    const db = getDB()

    if (!db) {
      console.error('❌ [createNote] CRITICAL: DB is null/undefined!')
      return { error: '数据库连接失败' }
    }

    // 从表单数据中提取字段
    const title = formData.get('title')?.toString().trim()
    const content = formData.get('content')?.toString().trim()
    const isPublic = formData.get('is_public') === 'true'

    // 验证必填字段
    if (!title || !content) {
      return { error: '标题和内容不能为空' }
    }

    // 如果笔记是公开的，生成唯一的 slug
    let slug = null
    if (isPublic) {
      slug = nanoid(6) // 生成 6 位随机字符串

      // 检查 slug 是否已存在（极小概率，但需要处理）
      const existingNote = await db.prepare(
        'SELECT id FROM notes WHERE slug = ?'
      ).bind(slug).first()

      if (existingNote) {
        // 如果 slug 已存在，重新生成
        slug = nanoid(6)
      }
    }

    // 插入新笔记
    const result = await db.prepare(
      `INSERT INTO notes (title, content, is_public, slug) 
       VALUES (?, ?, ?, ?)`
    ).bind(title, content, isPublic ? 1 : 0, slug).run()

    if (!result.success) {
      return { error: '创建笔记失败' }
    }

    console.log('✅ [createNote] Note created successfully!')
    // 返回成功标志，让客户端处理重定向
    return { success: true }

  } catch (error) {
    console.error('❌ [createNote] Exception:', error)
    console.error('❌ [createNote] Error stack:', error.stack)
    console.error('❌ [createNote] Error message:', error.message)

    // 返回详细的错误信息用于调试
    return {
      error: `调试信息: ${error.message}`,
      debug: {
        errorType: error.constructor.name,
        errorStack: error.stack?.substring(0, 200),
        dbType: typeof getDB(),
        hasDB: !!getDB()
      }
    }
  }
}

// 获取笔记列表
export async function getNotesList(query = '') {
  try {
    const db = getDB()

    let sql = `
      SELECT id, title, content, is_public, slug, created_at 
      FROM notes 
    `

    let params = []

    // 如果有搜索查询，添加 WHERE 条件
    if (query.trim()) {
      sql += `WHERE (title LIKE ? OR content LIKE ?) `
      const searchTerm = `%${query.trim()}%`
      params = [searchTerm, searchTerm]
    }

    // 添加排序和限制
    sql += `ORDER BY created_at DESC LIMIT 20`

    const stmt = db.prepare(sql)
    const notes = await stmt.bind(...params).all()

    return {
      success: true,
      data: notes.results || []
    }

  } catch (error) {
    console.error('获取笔记列表错误:', error)
    return {
      success: false,
      error: '获取笔记列表失败',
      data: []
    }
  }
}

// 根据 ID 获取单条笔记
export async function getNoteById(id) {
  try {
    const db = getDB()

    const note = await db.prepare(
      `SELECT id, title, content, is_public, slug, created_at 
       FROM notes 
       WHERE id = ?`
    ).bind(id).first()

    if (!note) {
      return {
        success: false,
        error: '笔记不存在'
      }
    }

    return {
      success: true,
      data: note
    }

  } catch (error) {
    console.error('获取笔记错误:', error)
    return {
      success: false,
      error: '获取笔记失败'
    }
  }
}

// 根据 Slug 获取公开笔记
export async function getNoteBySlug(slug) {
  try {
    const db = getDB()

    const note = await db.prepare(
      `SELECT id, title, content, is_public, slug, created_at 
       FROM notes 
       WHERE slug = ? AND is_public = 1`
    ).bind(slug).first()

    if (!note) {
      return {
        success: false,
        error: '公开笔记不存在或已被删除'
      }
    }

    return {
      success: true,
      data: note
    }

  } catch (error) {
    console.error('获取公开笔记错误:', error)
    return {
      success: false,
      error: '获取公开笔记失败'
    }
  }
}

import { cookies } from 'next/headers'

// ... (其他 imports)

// 鉴权辅助函数
async function isAuthenticated() {
  const cookieStore = await cookies()
  return !!cookieStore.get('auth_token')
}

// ...

// 更新笔记
export async function updateNote(id, formData) {
  // 🔒 鉴权检查
  if (!(await isAuthenticated())) {
    return { error: '未授权的操作' }
  }

  try {
    const db = getDB()

    const title = formData.get('title')?.toString().trim()
    const content = formData.get('content')?.toString().trim()
    const isPublic = formData.get('is_public') === 'true'

    // 验证必填字段
    if (!title || !content) {
      return { error: '标题和内容不能为空' }
    }

    // 检查笔记是否存在
    const existingNote = await getNoteById(id)
    if (!existingNote.success) {
      return { error: '笔记不存在' }
    }

    let slug = existingNote.data.slug

    // 如果笔记从私有变为公开，需要生成 slug
    if (isPublic && !slug) {
      slug = nanoid(6)

      // 检查 slug 是否已存在
      const existingSlug = await db.prepare(
        'SELECT id FROM notes WHERE slug = ? AND id != ?'
      ).bind(slug, id).first()

      if (existingSlug) {
        slug = nanoid(6)
      }
    }

    // 如果笔记从公开变为私有，清除 slug
    if (!isPublic) {
      slug = null
    }

    // 更新笔记
    const result = await db.prepare(
      `UPDATE notes 
       SET title = ?, content = ?, is_public = ?, slug = ? 
       WHERE id = ?`
    ).bind(title, content, isPublic ? 1 : 0, slug, id).run()

    if (!result.success) {
      return { error: '更新笔记失败' }
    }

    return { success: true, id }

  } catch (error) {
    console.error('更新笔记错误:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}

// 删除笔记
export async function deleteNote(id) {
  // 🔒 鉴权检查
  if (!(await isAuthenticated())) {
    return { error: '未授权的操作' }
  }

  try {
    const db = getDB()
    const result = await db.prepare(
      'DELETE FROM notes WHERE id = ?'
    ).bind(id).run()

    if (!result.success) {
      return { error: '删除笔记失败' }
    }

    return { success: true }

  } catch (error) {
    console.error('删除笔记错误:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}