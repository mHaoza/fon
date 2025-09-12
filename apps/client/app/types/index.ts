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
  filterList?: { title?: string, filter?: (todoList: Todo[]) => Todo[] }[]
}
