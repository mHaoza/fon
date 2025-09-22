<script setup lang="ts">
import { MdEditor } from '@fon/ui'
import { debounce } from 'lodash-es'
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()

const updateTodo = debounce(async () => {
  if (todoStore.activeTodo) {
    todoStore.updateTodo(todoStore.activeTodo)
  }
}, 1000)
</script>

<template>
  <div class="p-4 flex h-full overflow-hidden">
    <TodoList class="flex-1" />

    <div class="pl-2 h-full w-1/2">
      <MdEditor
        v-if="todoStore.activeTodo"
        v-model:value="todoStore.activeTodo.content"
        height="100%"
        placeholder="请输入内容"
        @change="updateTodo"
        @blur="updateTodo.flush()"
      />
    </div>
  </div>
</template>

<style scoped></style>
