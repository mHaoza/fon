// 从数据库层导入并导出类型
import type { Tag } from '~/db/tags'
import type { Todo, TodoCreate, TodoListQuery } from '~/db/todos'

export type { Tag, Todo, TodoCreate, TodoListQuery }

// 统一的API响应结构
export interface ApiResponse<T> {
  /** 响应状态码：200表示成功，其他表示失败 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据，成功时包含实际数据 */
  data: T
  /** 响应时间戳 */
  timestamp: number
}

export interface PaginationListResponse<T> {
  total: number
  page: number
  page_size: number
  total_pages: number
  data: T[]
}

export interface ListQuery {
  page?: number
  page_size?: number
  sort?: string
  order?: 'asc' | 'desc'
}
