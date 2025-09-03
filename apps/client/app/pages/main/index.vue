<script setup lang="ts">
import { ScrollArea } from '@fon/ui'
import AddInput from './modules/add-input.vue'
import TodoDetail from './modules/todo-detail.vue'
import TodoFilter from './modules/todo-filter.vue'
import TodoList from './modules/todo-list.vue'

useHead({ title: 'Fon-main' })
</script>

<template>
  <div class="bg-white grid grid-cols-[1fr] grid-rows-[auto_1fr] h-screen w-screen">
    <TitleBar />

    <div class="p-4 flex h-full overflow-hidden">
      <TodoFilter />
      <div class="todo-list flex flex-col flex-1 h-full">
        <AddInput />

        <ScrollArea>
          <TodoList />
        </ScrollArea>
      </div>
      <div class="todo-item-content w-1/2">
        <TodoDetail />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
