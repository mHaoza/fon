import type { CreateTodo, Todo, TodoListFilterInfo } from '~/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAddTodo, fetchGetTagList, fetchGetTodoById, fetchUpdateTodo } from '~/services/todo'

export const useTodoStore = defineStore('todo', () => {
  // 当前筛选筛选参数
  const activeFilterKey = ref<string>('')
  const filterInfoList = ref <TodoListFilterInfo[]>([])

  // tagList
  const { data: tagList, refresh: refreshTagList } = useAsyncData(
    'tagList',
    fetchGetTagList,
    { default: () => [] },
  )

  const activeTodoId = ref<string | null>(null)
  const activeTodo = ref<Todo | null>(null)

  // 监听筛选条件变化，刷新todo列表
  watch(activeFilterKey, () => {
    activeTodoId.value = null
  })

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
    refreshTagList()
  }

  async function updateTodo(todo: Parameters<typeof fetchUpdateTodo>[0]) {
    await fetchUpdateTodo(todo)
    refreshTagList()
  }

  return {
    tagList,
    activeTodoId,
    activeTodo,
    activeFilterKey,
    filterInfoList,

    addTodo,
    updateTodo,
    refreshTagList,
  }
})
