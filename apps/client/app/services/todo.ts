import type { CreateTodo, Todo } from '~/types'
import { invoke } from '@tauri-apps/api/core'

export async function fetchGetTodoList() {
  const todoList = await invoke('get_todo_list') as Todo[]
  return todoList
}

export async function fetchGetTagList() {
  const tagList = await invoke('get_all_tags') as string[]
  return tagList
}

export async function fetchAddTodo(todo: CreateTodo) {
  const newTodo = await invoke('add_todo', { todoData: todo }) as Todo
  return newTodo
}

// export async function fetchAddTag(tag: string) {

// }

export async function fetchGetTodoById(id: string) {
  const todo = await invoke('get_todo_by_id', { id }) as Todo || null
  return todo
}

export async function fetchUpdateTodo(todo: Partial<Todo> & { id: Todo['id'] }) {
  const updatedTodo = await invoke('update_todo', { updateData: todo }) as Todo
  return updatedTodo
}

export async function fetchDeleteTodo(id: string) {
  await invoke('delete_todo', { id })
}
