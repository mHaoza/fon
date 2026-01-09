import type { ListQuery, PaginationListResponse } from '~/types'
import { db } from './index'
import { getOrCreateTag } from './tags'

export interface Todo {
  id: number
  title: string
  date: number | null
  repeat: 'never' | 'daily' | 'weekly' | 'monthly'
  end_repeat_type: 'always' | 'date' | 'count' | null
  end_repeat_date: number | null
  remaining_count: number | null
  content: string
  tags: string[]
  category: string | null
  is_done: number
  is_deleted: number
  created_at: number
  updated_at: number
}

export type TodoCreate = Omit<Todo, 'id' | 'created_at' | 'updated_at'>

export interface TodoListQuery extends ListQuery {
  tags?: string[]
  category?: string
  is_done?: number
  sort?: keyof Todo
}

// 初始化待办事项表
export async function initTodosDb() {
  // 创建 todos 表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date INTEGER,
      repeat TEXT NOT NULL DEFAULT 'never',
      end_repeat_type TEXT,
      end_repeat_date INTEGER,
      remaining_count INTEGER,
      content TEXT NOT NULL DEFAULT '',
      category TEXT,
      is_done INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  // 创建 todo_tags 关联表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS todo_tags (
      todo_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (todo_id, tag_id),
      FOREIGN KEY (todo_id) REFERENCES todos (id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
    )
  `)

  // 创建索引以提高查询性能
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_todos_is_deleted ON todos(is_deleted)
  `)
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_todos_is_done ON todos(is_done)
  `)
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category)
  `)
}

// 获取待办事项的标签列表
async function getTodoTags(todoId: number): Promise<string[]> {
  const result = await db.select<{ name: string }[]>(`
    SELECT t.name FROM tags t
    INNER JOIN todo_tags tt ON t.id = tt.tag_id
    WHERE tt.todo_id = $1
    ORDER BY t.name ASC
  `, [todoId])

  return result.map(row => row.name)
}

// 同步待办事项的标签关联
async function syncTodoTags(todoId: number, tags: string[]): Promise<void> {
  // 删除现有的标签关联
  await db.execute('DELETE FROM todo_tags WHERE todo_id = $1', [todoId])

  // 添加新的标签关联
  for (const tagName of tags) {
    const tag = await getOrCreateTag(tagName)
    await db.execute(
      'INSERT INTO todo_tags (todo_id, tag_id) VALUES ($1, $2)',
      [todoId, tag.id],
    )
  }
}

// 添加新的待办事项
export async function addTodo(todoCreate: TodoCreate): Promise<Todo> {
  const now = Date.now()

  const result = await db.execute(`
    INSERT INTO todos (
      title, date, repeat, end_repeat_type, end_repeat_date,
      remaining_count, content, category, is_done, is_deleted,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [
    todoCreate.title,
    todoCreate.date,
    todoCreate.repeat,
    todoCreate.end_repeat_type,
    todoCreate.end_repeat_date,
    todoCreate.remaining_count,
    todoCreate.content,
    todoCreate.category,
    todoCreate.is_done ? 1 : 0,
    todoCreate.is_deleted ? 1 : 0,
    now,
    now,
  ])

  // 获取自动生成的 id
  const id = result.lastInsertId
  if (!id) {
    throw new Error('Failed to get inserted todo id')
  }

  // 处理标签
  await syncTodoTags(id, todoCreate.tags)

  // 获取完整的待办事项
  const todo = await getTodoById(id)
  if (!todo) {
    throw new Error('Failed to create todo')
  }

  return todo
}

// 根据 ID 获取待办事项
export async function getTodoById(id: number): Promise<Todo | null> {
  const result = await db.select<Todo[]>('SELECT * FROM todos WHERE id = $1', [id])

  if (result.length === 0) {
    return null
  }

  const todo = result[0]!
  todo.tags = await getTodoTags(id)
  return todo
}

// 更新待办事项
export async function updateTodo(update: Partial<Todo> & { id: number }): Promise<Todo> {
  const setClauses: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (update.title !== undefined) {
    setClauses.push(`title = $${paramIndex++}`)
    params.push(update.title)
  }
  if (update.date !== undefined) {
    setClauses.push(`date = $${paramIndex++}`)
    params.push(update.date)
  }
  if (update.repeat !== undefined) {
    setClauses.push(`repeat = $${paramIndex++}`)
    params.push(update.repeat)
  }
  if (update.end_repeat_type !== undefined) {
    setClauses.push(`end_repeat_type = $${paramIndex++}`)
    params.push(update.end_repeat_type)
  }
  if (update.end_repeat_date !== undefined) {
    setClauses.push(`end_repeat_date = $${paramIndex++}`)
    params.push(update.end_repeat_date)
  }
  if (update.remaining_count !== undefined) {
    setClauses.push(`remaining_count = $${paramIndex++}`)
    params.push(update.remaining_count)
  }
  if (update.content !== undefined) {
    setClauses.push(`content = $${paramIndex++}`)
    params.push(update.content)
  }
  if (update.category !== undefined) {
    setClauses.push(`category = $${paramIndex++}`)
    params.push(update.category)
  }
  if (update.is_done !== undefined) {
    setClauses.push(`is_done = $${paramIndex++}`)
    params.push(update.is_done ? 1 : 0)
  }
  if (update.is_deleted !== undefined) {
    setClauses.push(`is_deleted = $${paramIndex++}`)
    params.push(update.is_deleted ? 1 : 0)
  }

  if (setClauses.length > 0) {
    // 总是更新 updated_at
    setClauses.push(`updated_at = $${paramIndex++}`)
    params.push(Date.now())

    // 添加 WHERE 条件的 ID
    params.push(update.id)

    const sql = `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`
    await db.execute(sql, params)
  }

  // 更新标签关联
  if (update.tags !== undefined) {
    await syncTodoTags(update.id, update.tags)
  }

  // 获取更新后的待办事项
  const todo = await getTodoById(update.id)
  if (!todo) {
    throw new Error('Todo not found after update')
  }

  return todo
}

// 删除待办事项（软删除）
export async function deleteTodo(id: number): Promise<void> {
  await db.execute(
    'UPDATE todos SET is_deleted = 1, updated_at = $1 WHERE id = $2',
    [Date.now(), id],
  )
}

// 永久删除待办事项
export async function permanentlyDeleteTodo(id: number): Promise<void> {
  // 先删除关联的标签
  await db.execute('DELETE FROM todo_tags WHERE todo_id = $1', [id])

  // 删除待办事项
  await db.execute('DELETE FROM todos WHERE id = $1', [id])
}

// 恢复待办事项
export async function restoreTodo(id: number): Promise<Todo> {
  await db.execute(
    'UPDATE todos SET is_deleted = 0, updated_at = $1 WHERE id = $2',
    [Date.now(), id],
  )

  const todo = await getTodoById(id)
  if (!todo) {
    throw new Error('Todo not found after restore')
  }

  return todo
}

// 构建查询条件和参数
function buildWhereClause(query: TodoListQuery, isDeleted: boolean) {
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  // 基本条件
  conditions.push(`is_deleted = $${paramIndex++}`)
  params.push(isDeleted ? 1 : 0)

  // 完成状态筛选
  if (query.is_done !== undefined) {
    conditions.push(`is_done = $${paramIndex++}`)
    params.push(query.is_done ? 1 : 0)
  }

  // 分类筛选
  if (query.category !== undefined && query.category !== null) {
    conditions.push(`category = $${paramIndex++}`)
    params.push(query.category)
  }

  // 标签筛选（需要子查询）
  if (query.tags && query.tags.length > 0) {
    const tagPlaceholders = query.tags.map(() => `$${paramIndex++}`).join(',')
    conditions.push(`id IN (
      SELECT DISTINCT todo_id FROM todo_tags tt
      INNER JOIN tags t ON tt.tag_id = t.id
      WHERE t.name IN (${tagPlaceholders})
    )`)
    params.push(...query.tags)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  return { whereClause, params, nextParamIndex: paramIndex }
}

// 获取待办事项列表（支持分页和筛选）
export async function getTodoList(query: TodoListQuery): Promise<PaginationListResponse<Todo>> {
  const { whereClause, params } = buildWhereClause(query, false)

  // 排序
  const sortBy = (query.sort as string) || 'created_at'
  const sortOrder = query.order || 'desc'
  const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`

  // 检查是否需要分页
  const page = query.page || 1
  const pageSize = query.page_size || 50

  // 获取总数
  const countSql = `SELECT COUNT(*) as total FROM todos ${whereClause}`
  const countResult = await db.select<{ total: number }[]>(countSql, params)
  const total = countResult[0]?.total || 0

  // 获取数据
  const offset = (page - 1) * pageSize
  const dataSql = `SELECT * FROM todos ${whereClause} ${orderClause} LIMIT ${pageSize} OFFSET ${offset}`
  const todos = await db.select<Todo[]>(dataSql, params)

  // 为每个待办事项获取标签
  for (const todo of todos) {
    todo.tags = await getTodoTags(todo.id)
  }

  const totalPages = Math.ceil(total / pageSize)

  return {
    data: todos,
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
  }
}

// 获取已删除的待办事项列表
export async function getDeletedTodoList(query: TodoListQuery): Promise<PaginationListResponse<Todo>> {
  const { whereClause, params } = buildWhereClause(query, true)

  // 排序
  const sortBy = (query.sort as string) || 'updated_at'
  const sortOrder = query.order || 'desc'
  const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`

  // 检查是否需要分页
  const page = query.page || 1
  const pageSize = query.page_size || 50

  // 获取总数
  const countSql = `SELECT COUNT(*) as total FROM todos ${whereClause}`
  const countResult = await db.select<{ total: number }[]>(countSql, params)
  const total = countResult[0]?.total || 0

  // 获取数据
  const offset = (page - 1) * pageSize
  const dataSql = `SELECT * FROM todos ${whereClause} ${orderClause} LIMIT ${pageSize} OFFSET ${offset}`
  const todos = await db.select<Todo[]>(dataSql, params)

  // 为每个待办事项获取标签
  for (const todo of todos) {
    todo.tags = await getTodoTags(todo.id)
  }

  const totalPages = Math.ceil(total / pageSize)

  return {
    data: todos,
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
  }
}
