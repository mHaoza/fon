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
    } catch (error) {
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
</script>

<template>
  <ScrollArea>
    <template v-for="({ todoList, filterList, params, total }) in todoListGroup">
      <Collapsible v-for="(filterItem, filterIndex) in (filterList ?? [{}])" :key="filterIndex" :title="filterItem.title" default-open>
        <TodoListItem v-for="(todo) in filterItem.filter?.(todoList) ?? todoList" :key="todo.id" :todo="todo" />
        <div v-if="params.page && todoList.length < total">
          更多
        </div>
      </Collapsible>
    </template>
  </ScrollArea>
</template>
