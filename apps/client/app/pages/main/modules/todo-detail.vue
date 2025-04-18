<script setup lang="ts">
import type { Todo } from '~/types'
import { MdEditor } from '@fon/ui'
import { debounce } from 'lodash-es'
import { fetchGetTodoById, fetchUpdateTodo } from '~/services/todo'

const props = defineProps<{ todoId: string | null }>()
const emit = defineEmits<{
  (e: 'update'): void
}>()
const todo = ref<Todo | null>(null)

watch(() => props.todoId, async (value) => {
  if (value) {
    todo.value = await fetchGetTodoById(value) ?? null
  }
  else {
    todo.value = null
  }
})

const updateTodo = debounce(async () => {
  if (todo.value) {
    await fetchUpdateTodo(todo.value)
    emit('update')
  }
}, 1000)
</script>

<template>
  <div class="h-full">
    <MdEditor
      v-if="todo"
      v-model:value="todo.content"
      height="100%"
      placeholder="请输入内容"
      @change="updateTodo"
      @blur="updateTodo.flush()"
    />
  </div>
</template>
