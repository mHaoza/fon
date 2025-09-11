import type { CreateTodo, Todo } from '~/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAddTodo, fetchGetTagList, fetchGetTodoById, fetchGetTodoList, fetchUpdateTodo } from '~/services/todo'

export const useTodoStore = defineStore('todo', () => {
  // 筛选参数
  const filterInfo = ref<{ activeKey: string | null, params: Record<string, any> }>({
    activeKey: null,
    params: { },
  })

  // todoList
  const { data: todoList, refresh: refreshTodoList } = useAsyncData(
    'todoList',
    async () => {
      const result = await fetchGetTodoList(filterInfo.value.params)
      return result.data
    },
    {
      default: () => [],
      watch: [() => filterInfo.value.params],
    },
  )

  // tagList
  const { data: tagList, refresh: refreshTagList } = useAsyncData(
    'tagList',
    fetchGetTagList,
    { default: () => [] },
  )

  const activeTodoId = ref<string | null>(null)
  const activeTodo = ref<Todo | null>(null)

  // 监听筛选条件变化，刷新todo列表
  watch(
    () => filterInfo.value.activeKey,
    () => {
      activeTodoId.value = null
    },
  )

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
    refreshTagList()
  }

  async function updateTodo(todo: Parameters<typeof fetchUpdateTodo>[0]) {
    await fetchUpdateTodo(todo)
    refreshTodoList()
    refreshTagList()
  }

  return {
    todoList,
    tagList,
    activeTodoId,
    activeTodo,
    filterInfo,

    addTodo,
    updateTodo,
    refreshTodoList,
    refreshTagList,
  }
})
