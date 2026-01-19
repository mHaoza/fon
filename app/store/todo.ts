import type { Todo, TodoCreate } from '~/types'
import { defineStore } from 'pinia'
import * as todosDb from '~/db/todos'
import { useTagStore } from './tag'

export const useTodoStore = defineStore('todo', () => {
  const route = useRoute()
  const router = useRouter()
  const tagStore = useTagStore()

  /** 待办事项列表 */
  const todos = reactive({
    undone: useTodoList(todosDb.getTodoList, { is_done: 0 }),
    done: useTodoList(todosDb.getTodoList, { is_done: 1, page: 1, page_size: 50 }),
    deleted: useTodoList(todosDb.getDeletedTodoList, {}),
  })

  const activeTodoId = computed({
    get() {
      return route.query.todo ? Number(route.query.todo) : null
    },
    set(value: number | null) {
      router.push({
        path: route.path,
        hash: route.hash,
        query: {
          ...route.query,
          todo: value?.toString() || '',
        },
      })
    },
  })
  const activeTodo = ref<Todo | null>(null)

  watch(
    activeTodoId,
    async (id) => {
      if (id) {
        activeTodo.value = await todosDb.getTodoById(id)
      } else {
        activeTodo.value = null
      }
    },
    { immediate: true },
  )

  /** 新增待办 */
  async function addTodo(todo: TodoCreate) {
    try {
      const result = await todosDb.addTodo(todo)
      updateTodoList('add', result)
      tagStore.refreshTagList()
      return result
    } catch (error) {
      console.error('添加待办事项失败:', error)
      throw error
    }
  }

  /** 更新待办 */
  async function updateTodo(todo: Parameters<typeof todosDb.updateTodo>[0]) {
    const result = await todosDb.updateTodo(todo)

    updateTodoList('update', result)
    tagStore.refreshTagList()
  }

  /** 删除待办 */
  async function deleteTodo(id: number) {
    await todosDb.deleteTodo(id)
    updateTodoList('delete', id)
    tagStore.refreshTagList()
  }

  /** 永久删除待办 */
  async function permanentlyDeleteTodo(id: number) {
    await todosDb.permanentlyDeleteTodo(id)
    // 永久删除仅需从 deleted 列表移除
    updateTodoList('removeFromDeleted', id)
    tagStore.refreshTagList()
  }

  /** 恢复待办 */
  async function restoreTodo(id: number) {
    try {
      const result = await todosDb.restoreTodo(id)
      updateTodoList('add', result)
      // 从 deleted 列表移除
      updateTodoList('removeFromDeleted', id)
      tagStore.refreshTagList()
    } catch (error) {
      console.error('恢复待办事项失败:', error)
      throw error
    }
  }

  /** 更新待办列表 */
  function updateTodoList(type: 'add' | 'update', todo: Todo): void
  function updateTodoList(type: 'delete' | 'removeFromDeleted', id: number): void
  function updateTodoList(
    type: 'add' | 'update' | 'delete' | 'removeFromDeleted',
    todoOrId: Todo | number,
  ) {
    if (type === 'add' && typeof todoOrId !== 'number') {
      // 按照 created_at DESC 排序插入到正确位置
      const targetList = todoOrId.is_done ? todos.done.list : todos.undone.list
      insertTodoInSortedOrder(targetList, todoOrId)
    } else if (type === 'update' && typeof todoOrId !== 'number') {
      const todo = todoOrId

      // 检查 todo 在 undone 列表中是否存在且已完成
      const undoneIndex = todos.undone.list.findIndex((item) => item.id === todo.id)
      if (undoneIndex !== -1 && todo.is_done) {
        // 从 undone 列表中移除
        todos.undone.list.splice(undoneIndex, 1)
        // 按照 created_at DESC 排序添加到 done 列表
        insertTodoInSortedOrder(todos.done.list, todo)
        return
      }

      // 检查 todo 在 done 列表中是否存在且未完成
      const doneIndex = todos.done.list.findIndex((item) => item.id === todo.id)
      if (doneIndex !== -1 && !todo.is_done) {
        // 从 done 列表中移除
        todos.done.list.splice(doneIndex, 1)
        // 按照 created_at DESC 排序添加到 undone 列表
        insertTodoInSortedOrder(todos.undone.list, todo)
        return
      }

      // 如果状态没有变化，直接更新对应列表中的项目
      ;(Object.keys(todos) as (keyof typeof todos)[]).forEach((key) => {
        const index = todos[key as keyof typeof todos].list.findIndex((item) => item.id === todo.id)
        if (index !== -1) {
          todos[key].list.splice(index, 1, todo)
        }
      })
    } else if (type === 'delete') {
      ;(['undone', 'done'] as const).forEach((key) => {
        const index = todos[key].list.findIndex((item) => item.id === todoOrId)
        if (index !== -1) {
          todos[key].list.splice(index, 1)
        }
      })
    } else if (type === 'removeFromDeleted') {
      const index = todos.deleted.list.findIndex((item) => item.id === todoOrId)
      if (index !== -1) {
        todos.deleted.list.splice(index, 1)
      }
    }
  }

  // 按照 created_at DESC 排序插入 todo 到正确位置
  function insertTodoInSortedOrder(list: Todo[], todo: Todo) {
    // 找到应该插入的位置：created_at 大于等于当前 todo 的第一个位置
    const insertIndex = list.findIndex((item) => {
      const itemCreatedAt = new Date(item.created_at).getTime()
      const todoCreatedAt = new Date(todo.created_at).getTime()
      return itemCreatedAt < todoCreatedAt
    })

    if (insertIndex === -1) {
      // 如果没有找到合适的位置，插入到末尾
      list.push(todo)
    } else {
      // 插入到找到的位置
      list.splice(insertIndex, 0, todo)
    }
  }

  return {
    todos,
    activeTodoId,
    activeTodo,

    addTodo,
    updateTodo,
    deleteTodo,
    permanentlyDeleteTodo,
    restoreTodo,
  }
})
