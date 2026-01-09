<script setup lang="ts">
import type { TodoCreate } from '@/types'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { ref, useTemplateRef } from 'vue'
import TodoTitleInput from '@/components/TodoTitleInput/index.vue'
import { useTodoStore } from '~/store/todo'

const props = withDefaults(defineProps<{ placeholder?: string }>(), {
  placeholder: '+ 添加任务',
})

const route = useRoute()
const todoStore = useTodoStore()
const todoInput = useTemplateRef('todoInput')
const todo = ref<TodoCreate>(getDefaultTodoData())
const editorKey = ref(0)

function getDefaultTodoData(): TodoCreate {
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
    is_done: 0,
    is_deleted: 0,
  }
}

async function addTodo() {
  if (!todo.value.title.trim()) {
    return
  }

  try {
    const tags = todoInput.value?.getTags() ?? []

    // 如果当前视图是tag视图，自动添加该tag
    const viewTags = []
    if (typeof route.params.tagName === 'string') {
      viewTags.push(route.params.tagName)
    }

    const todoData = {
      ...todo.value,
      title: todo.value.title,
      tags: [...new Set([...todo.value.tags, ...tags, ...viewTags])],
    }

    await todoStore.addTodo(todoData)
    todo.value = getDefaultTodoData()
    editorKey.value++ // 强制重新挂载编辑器
  }
  catch (error) {
    console.error('Failed to add todo:', error)
  }
}

// 窗口显示时自动获取焦点
let unlisten: () => void
onMounted(async () => {
  // todoInput.value?.focus()
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
    class="todo-input mx-2 mb-2 px-3 py-1 border rounded-md flex items-center"
    :class="{
      'border-blue-600': todoInput?.isFocused,
      'border-gray-300': !todoInput?.isFocused,
      'bg-gray-300/10 border-transparent': !todo.title && !todoInput?.isFocused,
    }"
  >
    <TodoTitleInput
      :key="editorKey"
      ref="todoInput"
      v-model:value="todo.title"
      :placeholder="props.placeholder"
      class="flex-1"
      @enter="addTodo"
    />

    <div class="flex items-center" />
  </div>
</template>

<style scoped></style>
