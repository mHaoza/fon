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
  <div class="h-full">
    <MdEditor
      v-if="todoStore.activeTodo"
      v-model:value="todoStore.activeTodo.content"
      height="100%"
      placeholder="请输入内容"
      @change="updateTodo"
      @blur="updateTodo.flush()"
    />
  </div>
</template>
