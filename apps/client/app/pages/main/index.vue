<script setup lang="ts">
import AddInput from './modules/add-input.vue'
import TodoDetail from './modules/todo-detail.vue'
import TodoFilter from './modules/todo-filter.vue'
import TodoList from './modules/todo-list.vue'

useHead({ title: 'Fon-main' })
</script>

<template>
  <div class="p-4 flex h-full overflow-hidden">
    <TodoFilter class="pr-2 border-r border-gray-200/70 w-46" />

    <div class="px-2 border-r border-gray-200/70 flex flex-col flex-1 h-full">
      <AddInput class="mb-2" />

      <TodoList />
    </div>

    <div class="pl-2 w-1/2">
      <TodoDetail />
    </div>
  </div>
</template>

<style scoped></style>
