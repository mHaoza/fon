<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'
import type { Todo } from '@/types'
import { nextTick, ref, useTemplateRef } from 'vue'
import { useTodoStore } from '~/store/todo'

const todoInputRef = useTemplateRef('todoInputRef')

const todo = defineModel<Todo>('todo', { required: true })

const todoStore = useTodoStore()
const focusedTodo = ref<number | null>(null)

const checked = computed({
  get() {
    return !!todo.value.is_done
  },
  set(value) {
    todo.value.is_done = value ? 1 : 0
    todoStore.updateTodo({ id: todo.value.id, is_done: todo.value.is_done })
  },
})

function handleTodoClick(e: MouseEvent, todo: Todo) {
  const pos = document.caretPositionFromPoint(e.clientX, e.clientY)
  if (pos && pos.offset !== null) {
    setActiveTodo(todo.id)
    focusedTodo.value = todo.id
    nextTick(() => {
      todoInputRef.value?.focus()
    })
  }
}

async function updateTodoTitle(todo: Todo) {
  await todoStore.updateTodo({ id: todo.id, title: todo.title })
  focusedTodo.value = null
}

const router = useRouter()
function setActiveTodo(todoId?: number | null) {
  router.push({
    path: router.currentRoute.value.path,
    hash: router.currentRoute.value.hash,
    query: {
      ...router.currentRoute.value.query,
      todo: todoId?.toString() || '',
    },
  })
}

function getContextMenuItems(todo: Todo) {
  const items: ContextMenuItem[] = []
  if (!todo.is_deleted) {
    items.push(
      {
        label: '删除',
        icon: 'i-mdi-delete',
        color: 'error',
        onSelect: async () => {
          await todoStore.deleteTodo(todo.id)
          setActiveTodo(null)
        },
      },
    )
  }
  else {
    items.push(
      {
        label: '恢复',
        icon: 'i-mdi-delete-restore',
        onSelect: async () => {
          await todoStore.restoreTodo(todo.id)
          setActiveTodo(null)
        },
      },
      {
        label: '永久删除',
        icon: 'i-mdi-delete',
        onSelect: async () => {
          await todoStore.permanentlyDeleteTodo(todo.id)
          setActiveTodo(null)
        },
      },
    )
  }

  return items
}

const disabled = computed(() => {
  return !!todo.value.is_deleted
})
</script>

<template>
  <UContextMenu :items="getContextMenuItems(todo)">
    <div
      class="todo-input px-3 rounded-md flex min-h-9 shadow-xs items-center relative"
      :class="todoStore.activeTodoId === todo.id ? 'bg-gray-100' : 'hover:bg-gray-100/50'"
      @click="handleTodoClick($event, todo)"
    >
      <UCheckbox
        v-model="checked"
        color="secondary"
        class="mr-1"
        :disabled="disabled"
        @click.stop
      />
      <UInput
        v-model="todo.title"
        class="flex-1"
        :tag-enabled="false"
        placeholder="无标题"
        :disabled="disabled"
        variant="none"
        @blur="updateTodoTitle(todo)"
      />
      <TagView :tag-list="todo.tags" :max-tag-count="2" />
    </div>
  </UContextMenu>
</template>

<style scoped></style>
