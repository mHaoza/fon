<script setup lang="ts">
import type { CreateTodo } from '@/types'
// import DatePicker from '@/components/DatePicker'
import { TodoInput } from '@fon/ui'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { ref, useTemplateRef } from 'vue'
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()
const todoInput = useTemplateRef('todoInput')
const todo = ref<CreateTodo>(getDefaultTodoData())

function getDefaultTodoData(): CreateTodo {
  return {
    title: '',
    date: null,
    repeat: 'never',
    end_repeat_type: null,
    end_repeat_date: null,
    remaining_count: null,
    content: '',
    tags: [],
    category: null,
    is_done: false,
    is_deleted: false,
  }
}

function extractTagsFromTitle(title: string): { cleanTitle: string, tags: string[] } {
  const tagRegex = /#(\S+)\s/g
  const tags: string[] = []
  let match = tagRegex.exec(title)

  while (match !== null) {
    if (match[1]) {
      tags.push(match[1])
    }
    match = tagRegex.exec(title)
  }

  // Remove tags from title
  const cleanTitle = title.replace(/#\S+\s/g, '').trim()

  return { cleanTitle, tags }
}

async function addTodo() {
  if (!todo.value.title.trim()) {
    return
  }

  try {
    const { cleanTitle, tags } = extractTagsFromTitle(todo.value.title)

    const todoData = {
      ...todo.value,
      title: cleanTitle,
      tags: [...new Set([...todo.value.tags, ...tags])], // Merge and deduplicate tags
    }

    await todoStore.addTodo(todoData)
    todo.value = getDefaultTodoData()
  }
  catch (error) {
    console.error('Failed to add todo:', error)
  }
}

// 窗口显示时自动获取焦点
let unlisten: () => void
onMounted(async () => {
  todoInput.value?.focus()
  const webviewWindow = getCurrentWebviewWindow()
  unlisten = await webviewWindow.listen('show', () => {
    todoInput.value?.focus()
  })
})
onUnmounted(() => {
  unlisten()
})
</script>

<template>
  <div
    class="todo-input px-3 py-1 border rounded-md flex items-center"
    :class="todoInput?.isFocused ? 'border-blue-600' : 'bg-gray-300/10 border-transparent'"
  >
    <TodoInput ref="todoInput" v-model:value="todo.title" class="flex-1" @keyup.enter="addTodo">
      <template #placeholder>
        <div class="text-gray-400/90 flex items-center">
          <i class="i-lucide:plus text-icon-small mr-1" />
          Add task
        </div>
      </template>
    </TodoInput>

    <div class="flex items-center">
      <!-- <DatePicker v-model:data="todo" /> -->
    </div>
  </div>
</template>

<style scoped></style>
