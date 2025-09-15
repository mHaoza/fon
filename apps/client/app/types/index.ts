export interface Todo {
  id: string
  title: string
  date: number | null
  repeat: 'never' | 'daily' | 'weekly' | 'monthly'
  end_repeat_type: 'always' | 'date' | 'count' | null
  end_repeat_date: number | null
  remaining_count: number | null
  content: string
  tags: string[]
  category: string | null
  is_done: boolean
  is_deleted: boolean
  created_at: number
  updated_at: number
}

export type CreateTodo = Omit<Todo, 'id' | 'created_at' | 'updated_at'>

export interface Tag {
  id: string
  name: string
  created_at: number
}

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

export interface TodoListQuery {
  page?: number
  page_size?: number
  tags?: string[]
  category?: string
  is_done?: boolean
  sort?: keyof Todo
  order?: 'asc' | 'desc'
}

export interface TodoListFilterInfo {
  /** params */
  params: TodoListQuery
  /** 获取数据 */
  action: (params: TodoListQuery) => Promise<PaginationListResponse<Todo>>
  /** 分组列表 */
  filterList?: {
    title?: string
    filter?: (todoList: Todo[]) => Todo[]
    /** 默认折叠 */
    collapse?: boolean
  }[]
}
