-- Edge Notes 数据库表结构
-- 创建 notes 表

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    slug TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 为 slug 字段创建索引，提高查询性能
CREATE INDEX IF NOT EXISTS idx_notes_slug ON notes(slug);

-- 为 is_public 字段创建索引，便于查询公开笔记
CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);

-- 为 created_at 字段创建索引，便于按时间排序
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);