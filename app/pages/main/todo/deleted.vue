<script setup lang="ts">
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()
todoStore.todos.deleted.refresh()
</script>

<template>
  <div class="border-r border-neutral-200 flex flex-col h-full">
    <div class="text-xl font-semibold p-3 text-neutral-800">
      已删除
    </div>

    <UScrollArea virtualize :items="todoStore.todos.deleted.list" item-key="id" class="[scrollbar-gutter:stable] pb-6">
      <template #default="{ item }">
        <TodoListItem :todo="item" />
      </template>
    </UScrollArea>
  </div>
</template>
