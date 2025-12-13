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
    todoStore.todos.deleted.refresh()
  },
  { immediate: true },
)
</script>

<template>
  <ScrollArea @bottom-reached="todoStore.todos.deleted.loadMore">
    <Collapsible>
      <TodoListItem v-for="todo in todoStore.todos.deleted.list" :key="todo.id" :todo="todo" />
    </Collapsible>
  </ScrollArea>
</template>
