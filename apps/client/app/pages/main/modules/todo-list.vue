<script setup lang="ts">
import type { ContextMenuItem } from '@fon/ui'
import type { Todo } from '@/types'
import { ContextMenu, TodoInput } from '@fon/ui'
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { fetchGetTodoList, fetchUpdateTodo } from '~/services/todo'

const todoInputRefs = useTemplateRef('todoInputRef')

const { data: allTodos, refresh } = useAsyncData('todoList', fetchGetTodoList, { default: () => [] })
const todoList = computed(() => allTodos.value?.filter(todo => !todo.is_deleted) || [])
const activeTodo = defineModel<string | null>('activeTodo', { default: null })
const focusedTodo = ref<string | null>(null)

function setActiveTodo(todo: Todo, cursorPos?: number) {
  if (focusedTodo.value === todo.id) {
    return
  }
  activeTodo.value = todo.id
  focusedTodo.value = todo.id
  cursorPos = cursorPos ?? todo.title.length
  nextTick(() => {
    todoInputRefs.value?.[0]?.focus(cursorPos)
  })
}

function handleTodoClick(e: MouseEvent, todo: Todo) {
  const pos = document.caretPositionFromPoint(e.clientX, e.clientY)
  if (pos && pos.offset !== null) {
    setActiveTodo(todo, pos.offset)
  }
}

async function updateTodoStatus(todo: Todo) {
  try {
    await fetchUpdateTodo({ id: todo.id, is_done: todo.is_done })
  }
  catch (error) {
    console.error('Failed to update todo status:', error)
    // 恢复原状态
    todo.is_done = !todo.is_done
  }
}

async function updateTodoTitle(todo: Todo) {
  try {
    await fetchUpdateTodo({ id: todo.id, title: todo.title })
    focusedTodo.value = null
  }
  catch (error) {
    console.error('Failed to update todo title:', error)
  }
}

async function deleteTodo(todo: Todo) {
  try {
    await fetchUpdateTodo({ id: todo.id, is_deleted: true })
    await refresh()
    activeTodo.value = null
  }
  catch (error) {
    console.error('Failed to delete todo:', error)
  }
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

defineExpose({ refresh })
</script>

<template>
  <div class="todo-list">
    <ContextMenu
      v-for="(todo) in todoList"
      :key="todo.id"
      :items="getContextMenuItems(todo)"
    >
      <div
        class="todo-input px-3 rounded-md flex h-9 shadow-xs items-center relative"
        :class="activeTodo === todo.id ? 'bg-gray-100' : 'hover:bg-gray-100/70'"
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
  </div>
</template>

<style scoped></style>
