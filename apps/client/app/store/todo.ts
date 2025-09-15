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
      try {
        activeTodo.value = await fetchGetTodoById(id) ?? null
      } catch (error) {
        console.error('获取待办事项详情失败:', error)
        activeTodo.value = null
      }
    }
    else {
      activeTodo.value = null
    }
  })

  async function addTodo(todo: CreateTodo) {
    try {
      await fetchAddTodo(todo)
      refreshTagList()
    } catch (error) {
      console.error('添加待办事项失败:', error)
      throw error // 重新抛出错误，供组件处理
    }
  }

  async function updateTodo(todo: Parameters<typeof fetchUpdateTodo>[0]) {
    try {
      await fetchUpdateTodo(todo)
      refreshTagList()
    } catch (error) {
      console.error('更新待办事项失败:', error)
      throw error // 重新抛出错误，供组件处理
    }
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
