import type { ApiResponse, CreateTodo, PaginationListResponse, Tag, Todo, TodoListQuery } from '~/types'
import { invoke } from '@tauri-apps/api/core'
import { ApiResponseHandler } from '~/utils/api'

export async function fetchGetTodoList(data: TodoListQuery) {
  const response = await invoke<ApiResponse<PaginationListResponse<Todo>>>('get_todo_list_with_filter', { query: data })
  return ApiResponseHandler.unwrap(response)
}

export async function fetchGetTagList() {
  const response = await invoke<ApiResponse<Tag[]>>('get_tag_list')
  return ApiResponseHandler.unwrap(response)
}

export async function fetchAddTodo(todo: CreateTodo) {
  const response = await invoke<ApiResponse<Todo>>('add_todo', { createTodo: todo })
  return ApiResponseHandler.unwrap(response)
}

// export async function fetchAddTag(tag: string) {

// }

export async function fetchGetTodoById(id: string) {
  const response = await invoke<ApiResponse<Todo | null>>('get_todo_by_id', { id })
  return ApiResponseHandler.unwrap(response)
}

export async function fetchUpdateTodo(todo: Partial<Todo> & { id: Todo['id'] }) {
  const response = await invoke<ApiResponse<void>>('update_todo', { updateTodo: todo })
  ApiResponseHandler.unwrap(response)
  // 返回成功消息
  return ApiResponseHandler.getMessage(response)
}

export async function fetchDeleteTodo(id: string) {
  const response = await invoke<ApiResponse<void>>('delete_todo', { id })
  ApiResponseHandler.unwrap(response)
  // 返回成功消息
  return ApiResponseHandler.getMessage(response)
}
