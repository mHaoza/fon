import type { CreateTodo, PaginationListResponse, Tag, Todo, TodoListQuery } from '~/types'
import { invoke } from '@tauri-apps/api/core'

export async function fetchGetTodoList(data: TodoListQuery) {
  const result = await invoke<PaginationListResponse<Todo>>('get_todo_list_with_filter', { query: data })
  return result
}

export async function fetchGetTagList() {
  const result = await invoke<Tag[]>('get_tag_list')
  return result
}

export async function fetchAddTodo(todo: CreateTodo) {
  const result = await invoke<Todo>('add_todo', { createTodo: todo })
  return result
}

// export async function fetchAddTag(tag: string) {

// }

export async function fetchGetTodoById(id: string) {
  const result = await invoke<Todo | null>('get_todo_by_id', { id })
  return result
}

export async function fetchUpdateTodo(todo: Partial<Todo> & { id: Todo['id'] }) {
  const result = await invoke<Todo>('update_todo', { updateTodo: todo })
  return result
}

export async function fetchDeleteTodo(id: string) {
  await invoke('delete_todo', { id })
}
