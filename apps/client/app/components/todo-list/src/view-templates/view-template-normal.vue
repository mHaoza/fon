<script setup lang="ts">
import { Collapsible, ScrollArea } from '@fon/ui'
import { isEqual } from 'lodash-es'
import { useTodoStore } from '~/store/todo'
import TodoListItem from '../todo-list-item.vue'

const todoStore = useTodoStore()
const route = useRoute()

watch(
  () => todoStore.activeViewInfo?.query(route),
  (query, oldQuery) => {
    if (isEqual(query, oldQuery)) {
      return
    }
    todoStore.todos.done.refresh()
    todoStore.todos.undone.refresh()
  },
  { immediate: true },
)
</script>

<template>
  <ScrollArea @bottom-reached="todoStore.todos.done.loadMore">
    <Collapsible>
      <TodoListItem v-for="todo in todoStore.todos.undone.list" :key="todo.id" :todo="todo" />
    </Collapsible>

    <Collapsible v-if="todoStore.todos.done.list.length > 0" title="已完成" :default-open="false">
      <TodoListItem v-for="todo in todoStore.todos.done.list" :key="todo.id" :todo="todo" />
      <template #trigger-extra>
        <span class="text-xs text-gray-500 font-medium ml-2">{{ todoStore.todos.done.list.length }}</span>
      </template>
    </Collapsible>
  </ScrollArea>
</template>
