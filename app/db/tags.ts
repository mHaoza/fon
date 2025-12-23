import { db } from './index'

// Tag 类型定义
export interface Tag {
  id: number
  name: string
  created_at: number
}

// 初始化标签表
export async function initTagsDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    )
  `)
}

// 获取所有标签
export async function getTagList(): Promise<Tag[]> {
  const result = await db.select<Tag[]>('SELECT * FROM tags ORDER BY name ASC')
  return result
}

// 根据名称获取或创建标签
export async function getOrCreateTag(name: string): Promise<Tag> {
  // 先尝试查找现有标签
  const existing = await db.select<Tag[]>('SELECT * FROM tags WHERE name = $1', [name])

  if (existing.length > 0) {
    return existing[0]!
  }

  // 创建新标签
  const now = Date.now()
  const result = await db.execute(
    'INSERT INTO tags (name, created_at) VALUES ($1, $2)',
    [name, now],
  )

  const id = result.lastInsertId
  if (!id) {
    throw new Error('Failed to get inserted tag id')
  }

  return {
    id,
    name,
    created_at: now,
  }
}

// 删除标签（级联删除关联）
export async function deleteTag(id: number): Promise<void> {
  // 先删除所有使用该标签的关联
  await db.execute('DELETE FROM todo_tags WHERE tag_id = $1', [id])

  // 删除标签
  await db.execute('DELETE FROM tags WHERE id = $1', [id])
}
