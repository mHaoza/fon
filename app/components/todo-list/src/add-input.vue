<script setup lang="ts">
import type { CreateTodo } from '@/types'
// import DatePicker from '@/components/DatePicker'
import { TodoInput } from '@fon/ui'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { ref, useTemplateRef } from 'vue'
import { useTodoStore } from '~/store/todo'

const route = useRoute()
const todoStore = useTodoStore()
const todoInput = useTemplateRef('todoInput')
const todo = ref<CreateTodo>(getDefaultTodoData())

const placeholder = computed(() => {
  if (todoStore.activeViewInfo?.reg.test('#deleted')) {
    return ''
  }

  if (todoStore.activeViewInfo?.reg.test('#tag')) {
    const tag = typeof todoStore.activeViewInfo.title === 'string' ? todoStore.activeViewInfo.title : todoStore.activeViewInfo.title(route)
    return `添加任务至'${tag}'`
  }

  return '添加任务'
})

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

  const cleanTitle = title.replace(/#\S+\s/g, '').trim()

  return { cleanTitle, tags }
}

async function addTodo() {
  if (!todo.value.title.trim()) {
    return
  }

  try {
    const { cleanTitle, tags } = extractTagsFromTitle(todo.value.title)

    // 如果当前视图是tag视图，自动添加该tag
    const viewTags = []
    if (todoStore.activeViewInfo?.reg.test('#tag')) {
      const tag = typeof todoStore.activeViewInfo.title === 'string' ? todoStore.activeViewInfo.title : todoStore.activeViewInfo.title(route)
      viewTags.unshift(tag.replace('#', ''))
    }

    const todoData = {
      ...todo.value,
      title: cleanTitle,
      tags: [...new Set([...todo.value.tags, ...tags, ...viewTags])], // Merge and deduplicate tags
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
    v-if="placeholder"
    class="todo-input px-3 py-1 border rounded-md flex items-center"
    :class="{
      'border-blue-600': todoInput?.isFocused,
      'border-gray-300': !todoInput?.isFocused,
      'bg-gray-300/10 border-transparent': !todo.title && !todoInput?.isFocused,
    }"
  >
    <TodoInput ref="todoInput" v-model:value="todo.title" class="flex-1" @keyup.enter="addTodo">
      <template #placeholder>
        <div class="text-gray-400/90 flex items-center">
          <i class="i-lucide:plus text-icon-small mr-1" />
          {{ placeholder }}
        </div>
      </template>
    </TodoInput>

    <div class="flex items-center">
      <!-- <DatePicker v-model:data="todo" /> -->
    </div>
  </div>
</template>

<style scoped></style>
