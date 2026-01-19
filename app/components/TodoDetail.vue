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
  <div v-if="todoStore.activeTodo" class="flex h-full flex-col">
    <div class="flex min-h-9 items-center px-3 py-2">
      <UCheckbox
        v-model="checked"
        color="secondary"
        class="mr-2 pl-5"
        :disabled="!!todoStore.activeTodo?.is_deleted"
        @click.stop
      />
    </div>
    <USeparator color="neutral" />

    <UInput
      v-model="todoStore.activeTodo.title"
      :tag-enabled="false"
      placeholder="无标题"
      :disabled="!!todoStore.activeTodo?.is_deleted"
      variant="none"
      :ui="{
        base: 'text-xl font-semibold w-full pl-7',
      }"
      @blur="
        todoStore.updateTodo({
          id: todoStore.activeTodo.id,
          title: todoStore.activeTodo.title,
        })
      "
    />
    <div
      id="todo-content-wrap"
      class="flex-1 overflow-y-auto pb-6 [scrollbar-gutter:stable]"
      @click="handleContentClick"
    >
      <TodoContentEditor ref="editorRef" />
      <TodoTagInput />
    </div>
  </div>
  <div v-else class="grid h-full place-items-center pl-2">
    <UEmpty variant="naked" icon="i-lucide-file" description="请在左侧列表中选择一个待办事项" />
  </div>
</template>
