import type { CreateTodo, PaginationListResponse, Tag, Todo, TodoListQuery } from '~/types'
import { invoke } from '@tauri-apps/api/core'

export async function fetchGetTodoList(data: TodoListQuery) {
  const todoList = await invoke<PaginationListResponse<Todo>>('get_todo_list_with_filter', { query: data })
  return todoList
}

export async function fetchGetTagList() {
  const tagList = await invoke<Tag[]>('get_tag_list')
  return tagList
}

export async function fetchAddTodo(todo: CreateTodo) {
  const newTodo = await invoke<Todo>('add_todo', { createTodo: todo })
  return newTodo
}

// export async function fetchAddTag(tag: string) {

// }

export async function fetchGetTodoById(id: string) {
  const todo = await invoke<Todo | null>('get_todo_by_id', { id })
  return todo
}

export async function fetchUpdateTodo(todo: Partial<Todo> & { id: Todo['id'] }) {
  const updatedTodo = await invoke<Todo>('update_todo', { updateTodo: todo })
  return updatedTodo
}

export async function fetchDeleteTodo(id: string) {
  await invoke('delete_todo', { id })
}
