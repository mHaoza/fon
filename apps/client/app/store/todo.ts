import type { CreateTodo, Todo } from '~/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAddTodo, fetchGetTodoById, fetchGetTodoList, fetchUpdateTodo } from '~/services/todo'

export const useTodoStore = defineStore('todo', () => {
  const { data: todoList, refresh: refreshTodoList } = useAsyncData('todoList', fetchGetTodoList, { default: () => [] })
  const tagList = ref<string[]>([])
  const activeTodoId = ref<string | null>(null)
  const activeTodo = ref<Todo | null>(null)

  watch(activeTodoId, async (id) => {
    if (id) {
      activeTodo.value = await fetchGetTodoById(id) ?? null
    }
    else {
      activeTodo.value = null
    }
  })

  async function addTodo(todo: CreateTodo) {
    await fetchAddTodo(todo)
    refreshTodoList()
  }

  async function updateTodo(todo: Parameters<typeof fetchUpdateTodo>[0]) {
    await fetchUpdateTodo(todo)
    refreshTodoList()
  }

  return {
    todoList,
    tagList,
    activeTodoId,
    activeTodo,

    addTodo,
    updateTodo,
    refreshTodoList,
  }
})
