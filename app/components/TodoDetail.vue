<script setup lang="ts">
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()

const checked = computed({
  get() {
    return !!todoStore.activeTodo?.is_done
  },
  set(value) {
    if (todoStore.activeTodo) {
      todoStore.activeTodo.is_done = value ? 1 : 0
      todoStore.updateTodo({ id: todoStore.activeTodo.id, is_done: todoStore.activeTodo.is_done })
    }
  },
})

const editorRef = useTemplateRef('editorRef')

function handleContentClick(e: PointerEvent) {
  if ((e.target as HTMLElement).id === 'todo-content-wrap') {
    editorRef.value?.focus()
  }
}
</script>

<template>
  <div v-if="todoStore.activeTodo" class="pl-2 h-full flex flex-col">
    <div class="flex items-center min-h-9 px-3">
      <UCheckbox
        v-model="checked"
        color="secondary"
        class="mr-1"
        :disabled="!!todoStore.activeTodo?.is_deleted"
        @click.stop
      />
    </div>
    <USeparator />

    <UInput
      v-model="todoStore.activeTodo.title"
      class="w-full"
      :tag-enabled="false"
      placeholder="无标题"
      :disabled="!!todoStore.activeTodo?.is_deleted"
      variant="none"
      :ui="{
        base: 'text-xl font-bold w-full',
      }"
      @blur="todoStore.updateTodo({
        id: todoStore.activeTodo.id,
        title: todoStore.activeTodo.title,
      })"
    />
    <div id="todo-content-wrap" class="flex-1 overflow-y-auto [scrollbar-gutter:stable]" @click="handleContentClick">
      <TodoContentEditor ref="editorRef" />
      <TodoTagInput />
    </div>
  </div>
  <div v-else class="pl-2 h-full grid place-items-center">
    <UEmpty
      variant="naked"
      icon="i-lucide-file"
      description="请在左侧列表中选择一个待办事项"
    />
  </div>
</template>
