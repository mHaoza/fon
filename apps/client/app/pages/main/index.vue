<script setup lang="ts">
import { ScrollArea } from '@fon/ui'
import AddInput from './modules/add-input.vue'
import TodoDetail from './modules/todo-detail.vue'
import TodoList from './modules/todo-list.vue'

useHead({
  title: 'Fon-main',
})

const activeTodo = ref<string | null>(null)
const todoListRef = useTemplateRef('todoListRef')
</script>

<template>
  <div class="bg-white grid grid-cols-[1fr] grid-rows-[auto_1fr] h-screen w-screen">
    <TitleBar />

    <div class="p-4 flex h-full overflow-hidden">
      <!-- <div class="w-56">
        筛选器
      </div> -->
      <div class="todo-list flex flex-col flex-1 h-full">
        <AddInput @add="todoListRef?.refresh()" />

        <ScrollArea>
          <TodoList ref="todoListRef" v-model:active-todo="activeTodo" />
        </ScrollArea>
      </div>
      <div class="todo-item-content w-1/2">
        <TodoDetail :todo-id="activeTodo" @update="todoListRef?.refresh()" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
