<script setup lang="ts">
import type { Todo, TodoListFilterInfo } from '~/types'
import { Collapsible, ScrollArea } from '@fon/ui'
import { useTodoStore } from '~/store/todo'
import TodoListItem from './todo-list-item.vue'

const todoStore = useTodoStore()

const todoListGroup = ref<(TodoListFilterInfo & { todoList: Todo[], total: number })[]>([])

async function initTodoListGroup() {
  const groupList = []

  for (const filterInfo of todoStore.filterInfoList) {
    try {
      const result = await filterInfo.action(filterInfo.params)
      groupList.push({
        ...filterInfo,
        todoList: result.data,
        total: result.total,
      })
    }
    catch (error) {
      console.error('获取待办事项列表失败:', error)
      // 失败时添加空数据
      groupList.push({
        ...filterInfo,
        todoList: [],
        total: 0,
      })
    }
  }

  todoListGroup.value = groupList
}

watch(
  () => todoStore.activeFilterKey,
  () => {
    initTodoListGroup()
  },
  { immediate: true },
)

function filterTodoList(todoList: Todo [], filter?: ((todoList: Todo[]) => Todo[])) {
  return filter?.(todoList) ?? todoList
}

/** 加载更多 */
function handleBottomReached() {
  const filterInfo = todoListGroup.value.find((filterInfo) => {
    return filterInfo.filterList?.some((filterItem) => {
      return filterInfo.params.page !== undefined && filterItem.open
    })
  })
  if (filterInfo && filterInfo.todoList.length < filterInfo.total) {
    filterInfo.params.page! += 1
    filterInfo.action(filterInfo.params).then((result) => {
      filterInfo.todoList.push(...result.data)
    })
  }
}
</script>

<template>
  <ScrollArea @bottom-reached="handleBottomReached">
    <template v-for="({ todoList, filterList, params, total }) in todoListGroup">
      <template v-for="(filterItem, filterIndex) in (filterList ?? [{}])" :key="filterIndex">
        <Collapsible
          v-if="filterTodoList(todoList, filterItem.filter).length !== 0"
          v-model:open="filterItem.open"
          :title="filterItem.title"
        >
          <TodoListItem v-for="(todo) in filterTodoList(todoList, filterItem.filter)" :key="todo.id" :todo="todo" />
          <div v-if="params.page && todoList.length < total">
            更多
          </div>
        </Collapsible>
      </template>
    </template>
  </ScrollArea>
</template>
