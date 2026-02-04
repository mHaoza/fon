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
const isFocused = ref(false)

const todoAddInput = useTemplateRef('todoAddInput')
onClickOutside(todoAddInput, () => {
  isFocused.value = false
})

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
    const addTodo = await todoStore.addTodo(todoData)
    todoStore.activeTodoId = addTodo.id

    // 重置输入框
    todo.value = getDefaultTodoData()
    todoInput.value?.setContent(todo.value.title)
  } catch (error) {
    console.error('Failed to add todo:', error)
  }
}

// 窗口显示时自动获取焦点
let unlisten: () => void
onMounted(async () => {
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
    ref="todoAddInput"
    class="todo-input z-99 mx-2 mb-2 flex items-center rounded-md border px-3 py-1 transition-all"
    :class="{
      'border-primary bg-white': isFocused,
      'border-neutral-200 bg-neutral-50': !isFocused,
    }"
    @click="() => (isFocused = true)"
  >
    <TodoTitleInput
      ref="todoInput"
      v-model:value="todo.title"
      :placeholder="props.placeholder"
      class="flex-1"
      @enter="addTodo"
      @focus="() => (isFocused = true)"
    />

    <TodoCalendar v-if="isFocused || todo.title" v-model="todo" :portal="todoAddInput" />
  </div>
</template>

<style scoped></style>
