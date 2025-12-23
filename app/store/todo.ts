import type { Todo, TodoCreate } from '~/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { viewTemplateList } from '~/components/todo-list'
import * as tagsDb from '~/db/tags'
import * as todosDb from '~/db/todos'

export const useTodoStore = defineStore('todo', () => {
  const { data: tagList, refresh: refreshTagList } = useAsyncData('tagList', tagsDb.getTagList, {
    default: () => [],
  })
  const route = useRoute()

  const activeViewInfo = computed(() => viewTemplateList.find(item => item.reg.test(route.hash)) ?? null)
  const activeTodoId = computed(() => {
    const id = route.query.todo
    return id ? Number(id) : null
  })
  const activeTodo = ref<Todo | null>(null)

  watch(activeTodoId, async (id) => {
    if (id) {
      try {
        activeTodo.value = await todosDb.getTodoById(id) ?? null
      }
      catch {
        activeTodo.value = null
      }
    }
    else {
      activeTodo.value = null
    }
  }, { immediate: true })

  const query = computed(() => activeViewInfo.value?.query(route) ?? {})
  const todos = reactive({
    undone: useTodoList(todosDb.getTodoList, { is_done: false }, query),
    done: useTodoList(todosDb.getTodoList, { is_done: true, page: 1, page_size: 50 }, query),
    deleted: useTodoList(todosDb.getDeletedTodoList, {}, query),
  })

  /** 新增待办 */
  async function addTodo(todo: TodoCreate) {
    try {
      const result = await todosDb.addTodo(todo)
      updateTodoList('add', result)
      refreshTagList()
    }
    catch (error) {
      console.error('添加待办事项失败:', error)
      throw error
    }
  }

  /** 更新待办 */
  async function updateTodo(todo: Parameters<typeof todosDb.updateTodo>[0]) {
    const result = await todosDb.updateTodo(todo)

    updateTodoList('update', result)
    if (activeTodoId.value === result.id) {
      activeTodo.value = result
    }

    refreshTagList()
  }

  /** 删除待办 */
  async function deleteTodo(id: number) {
    await todosDb.deleteTodo(id)
    updateTodoList('delete', id)
    refreshTagList()
  }

  /** 永久删除待办 */
  async function permanentlyDeleteTodo(id: number) {
    await todosDb.permanentlyDeleteTodo(id)
    // 永久删除仅需从 deleted 列表移除
    updateTodoList('removeFromDeleted', id)
    refreshTagList()
  }

  /** 恢复待办 */
  async function restoreTodo(id: number) {
    try {
      const result = await todosDb.restoreTodo(id)
      updateTodoList('add', result)
      // 从 deleted 列表移除
      updateTodoList('removeFromDeleted', id)
      refreshTagList()
    }
    catch (error) {
      console.error('恢复待办事项失败:', error)
      throw error
    }
  }

  /** 删除标签 */
  async function deleteTag(tagId: number) {
    try {
      await tagsDb.deleteTag(tagId)
      refreshTagList()
      // 刷新所有待办列表，因为标签已从相关的 todo 中移除
      todos.undone.refresh()
      todos.done.refresh()
    }
    catch (error) {
      console.error('删除标签失败:', error)
      throw error
    }
  }

  /** 更新待办列表 */
  function updateTodoList(type: 'add' | 'update', todo: Todo): void
  function updateTodoList(type: 'delete' | 'removeFromDeleted', id: number): void
  function updateTodoList(type: 'add' | 'update' | 'delete' | 'removeFromDeleted', todoOrId: Todo | number) {
    if (type === 'add' && typeof todoOrId !== 'number') {
      // 按照 created_at DESC 排序插入到正确位置
      const targetList = todoOrId.is_done ? todos.done.list : todos.undone.list
      insertTodoInSortedOrder(targetList, todoOrId)
    }
    else if (type === 'update' && typeof todoOrId !== 'number') {
      const todo = todoOrId

      // 检查 todo 在 undone 列表中是否存在且已完成
      const undoneIndex = todos.undone.list.findIndex(item => item.id === todo.id)
      if (undoneIndex !== -1 && todo.is_done) {
        // 从 undone 列表中移除
        todos.undone.list.splice(undoneIndex, 1)
        // 按照 created_at DESC 排序添加到 done 列表
        insertTodoInSortedOrder(todos.done.list, todo)
        return
      }

      // 检查 todo 在 done 列表中是否存在且未完成
      const doneIndex = todos.done.list.findIndex(item => item.id === todo.id)
      if (doneIndex !== -1 && !todo.is_done) {
        // 从 done 列表中移除
        todos.done.list.splice(doneIndex, 1)
        // 按照 created_at DESC 排序添加到 undone 列表
        insertTodoInSortedOrder(todos.undone.list, todo)
        return
      }

      // 如果状态没有变化，直接更新对应列表中的项目
      (Object.keys(todos) as (keyof typeof todos)[]).forEach((key) => {
        const index = todos[key as keyof typeof todos].list.findIndex(item => item.id === todo.id)
        if (index !== -1) {
          todos[key].list.splice(index, 1, todo)
        }
      })
    }
    else if (type === 'delete') {
      ;(['undone', 'done'] as const).forEach((key) => {
        const index = todos[key].list.findIndex(item => item.id === todoOrId)
        if (index !== -1) {
          todos[key].list.splice(index, 1)
        }
      })
    }
    else if (type === 'removeFromDeleted') {
      const index = todos.deleted.list.findIndex(item => item.id === todoOrId)
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
    }
    else {
      // 插入到找到的位置
      list.splice(insertIndex, 0, todo)
    }
  }

  return {
    todos,
    tagList,
    activeViewInfo,
    activeTodoId,
    activeTodo,

    addTodo,
    updateTodo,
    deleteTodo,
    permanentlyDeleteTodo,
    restoreTodo,
    deleteTag,
    refreshTagList,
  }
})
