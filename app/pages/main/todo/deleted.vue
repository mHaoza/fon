<script setup lang="ts">
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()
todoStore.todos.deleted.refresh()
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="p-3 text-xl font-semibold text-neutral-800">已删除</div>

    <UScrollArea
      virtualize
      :items="todoStore.todos.deleted.list"
      item-key="id"
      class="pb-6 [scrollbar-gutter:stable]"
    >
      <template #default="{ item }">
        <TodoListItem :todo="item" />
      </template>
    </UScrollArea>
  </div>
</template>
