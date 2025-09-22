<script setup lang="ts">
import type { ContextMenuItem } from '@fon/ui'
import type { Todo } from '@/types'
import { ContextMenu, TodoInput } from '@fon/ui'
import { nextTick, ref, useTemplateRef } from 'vue'
import { useTodoStore } from '~/store/todo'

const todoInputRef = useTemplateRef('todoInputRef')

const todo = defineModel<Todo>('todo', { required: true })

const todoStore = useTodoStore()
const focusedTodo = ref<string | null>(null)

function handleTodoClick(e: MouseEvent, todo: Todo) {
  const pos = document.caretPositionFromPoint(e.clientX, e.clientY)
  if (pos && pos.offset !== null) {
    setActiveTodo(todo.id)
    focusedTodo.value = todo.id
    nextTick(() => {
      todoInputRef.value?.focus(pos.offset ?? todo.title.length)
    })
  }
}

async function updateTodoStatus(todo: Todo) {
  try {
    await todoStore.updateTodo({ id: todo.id, is_done: todo.is_done })
  }
  catch (error) {
    console.error('Failed to update todo status:', error)
    // 恢复原状态
    todo.is_done = !todo.is_done
  }
}

async function updateTodoTitle(todo: Todo) {
  try {
    await todoStore.updateTodo({ id: todo.id, title: todo.title })
    focusedTodo.value = null
  }
  catch (error) {
    console.error('Failed to update todo title:', error)
  }
}

async function deleteTodo(todo: Todo) {
  try {
    await todoStore.deleteTodo(todo.id)
    setActiveTodo(null)
  }
  catch (error) {
    console.error('Failed to delete todo:', error)
  }
}

const router = useRouter()
function setActiveTodo(todoId?: string | null) {
  router.push({
    path: router.currentRoute.value.path,
    hash: router.currentRoute.value.hash,
    query: {
      ...router.currentRoute.value.query,
      todo: todoId || '',
    },
  })
}

function getContextMenuItems(todo: Todo): ContextMenuItem[] {
  return [
    {
      value: 'delete',
      label: '删除',
      icon: 'i-mdi-delete',
      class: 'text-red-500',
      onClick: () => deleteTodo(todo),
    },
  ]
}
</script>

<template>
  <ContextMenu
    :items="getContextMenuItems(todo)"
  >
    <div
      class="todo-input px-3 rounded-md flex h-9 shadow-xs items-center relative"
      :class="todoStore.activeTodoId === todo.id ? 'bg-gray-100' : 'hover:bg-gray-100/50'"
      @click="handleTodoClick($event, todo)"
      @contextmenu="handleTodoClick($event, todo)"
    >
      <input
        v-model="todo.is_done"
        type="checkbox"
        class="mr-2 appearance-none border border-gray-400/60 rounded-[3px] grid h-4 w-4 cursor-pointer select-none place-content-center checked:border-blue-500 checked:bg-blue-500"
        @click.stop
        @change="updateTodoStatus(todo)"
      >
      <TodoInput
        v-if="focusedTodo === todo.id"
        ref="todoInputRef"
        v-model:value="todo.title"
        class="flex-1"
        :parse-hash-tag="false"
        @blur="updateTodoTitle(todo)"
      >
        <template #placeholder>
          <div class="text-gray-400/90 flex items-center">
            无标题
          </div>
        </template>
      </TodoInput>
      <template v-else>
        <div class="flex flex-1 text-nowrap overflow-hidden">
          <span v-if="todo.title">{{ todo.title }}</span>
          <span v-else class="text-gray-400/90">无标题</span>
        </div>
      </template>

      <TagView :tag-list="todo.tags" :max-tag-count="2" />

      <!-- <div class="flex items-center">
          <DatePicker v-model:data="todoStore.todoList[index]" :show-icon="false" @click.stop>
            <template #triggerButton="{ showDate, isExpired }">
              <span v-if="showDate" class="text-blue-400 ml-1 text-nowrap" :class="{ 'text-red-400': isExpired }">
                {{ dayjs(showDate).format('YYYY-MM-DD') }}
              </span>
            </template>
          </DatePicker>
        </div> -->
    </div>
  </ContextMenu>
</template>

<style scoped></style>
