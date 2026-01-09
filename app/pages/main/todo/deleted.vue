<script setup lang="ts">
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()
todoStore.todos.deleted.refresh()
</script>

<template>
  <div class="border-r border-gray-200/70 flex flex-col h-full">
    <div class="text-xl font-bold p-2">
      已删除
    </div>

    <UScrollArea virtualize :items="todoStore.todos.deleted.list" item-key="id" class="[scrollbar-gutter:stable]">
      <template #default="{ item }">
        <TodoListItem :todo="item" />
      </template>
    </UScrollArea>
  </div>
</template>
