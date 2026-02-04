<script setup lang="tsx">
import type { TodoCreate } from '~/types'
import { fromDate, getLocalTimeZone, ZonedDateTime } from '@internationalized/date'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'

const emit = defineEmits<{ (e: 'update'): void }>()

const props = withDefaults(
  defineProps<{
    hideIcon?: boolean
    placeholder?: string
    popoverContent?: object
  }>(),
  {
    hideIcon: false,
    placeholder: '',
    popoverContent: () => ({ side: 'bottom', align: 'end', alignOffset: -100 }),
  },
)

const open = ref(false)

const originTodo = defineModel<TodoCreate>('modelValue', { required: true })

const todo = ref<TodoCreate>(originTodo.value)

watch(
  () => originTodo.value,
  (newVal) => (todo.value = cloneDeep(newVal)),
  { immediate: true },
)

const date = computed({
  get() {
    return todo.value.date ? fromDate(new Date(todo.value.date), getLocalTimeZone()) : null
  },
  set(value) {
    if (value) {
      todo.value.date = value.toDate().getTime()
    } else {
      todo.value.date = null
    }
  },
})

const dateColor = computed(() => {
  // 如果超期则显示红色
  if (date.value && dayjs(date.value.toDate()).isBefore(dayjs(), 'day')) {
    return 'text-error'
  }

  // 如果无日期则显示默认颜色
  if (!date.value) {
    return 'text-dimmed'
  }

  return 'text-primary'
})

const dateIcon = (content: string) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <g
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <path d="M8 2v4m8-4v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </g>
      {content && (
        <text
          x="12"
          y="19"
          text-anchor="middle"
          font-size="8"
          font-weight="bold"
          fill="currentColor"
        >
          {content}
        </text>
      )}
    </svg>
  )
}

const buttonIcon = computed(() => {
  console.log('hideIcon', props.hideIcon)
  if (props.hideIcon) {
    return ''
  }
  return date.value ? dateIcon(dayjs(date.value!.toDate()).format('D')) : 'i-lucide-calendar-days'
})

const quickSelects = [
  {
    label: '今天',
    icon: 'i-lucide-sun',
    getDate: () => fromDate(new Date(), getLocalTimeZone()),
  },
  {
    label: '明天',
    icon: 'i-lucide-sunrise',
    getDate: () => fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000), getLocalTimeZone()),
  },
  {
    label: '下周',
    icon: dateIcon('+7'),
    getDate: () => fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), getLocalTimeZone()),
  },
]

function handleQuickSelect(value: ZonedDateTime) {
  date.value = value
  originTodo.value = cloneDeep(todo.value)
  open.value = false
  emit('update')
}

function handleClear() {
  todo.value.date = null
  originTodo.value = cloneDeep(todo.value)
  open.value = false
  emit('update')
}

function handleConfirm() {
  originTodo.value = cloneDeep(todo.value)
  open.value = false
  emit('update')
}
</script>

<template>
  <UPopover
    v-bind="$attrs"
    v-model:open="open"
    :content="props.popoverContent"
    @update:open="todo = cloneDeep(originTodo)"
  >
    <UButton
      variant="ghost"
      color="neutral"
      :icon="buttonIcon"
      size="xs"
      :ui="{ base: `px-1 ${dateColor} cursor-pointer` }"
    >
      {{ date ? dayjs(date.toDate()).format('M月D日') : props.placeholder }}
    </UButton>

    <template #content>
      <div class="flex gap-2 p-2">
        <UButton
          v-for="select in quickSelects"
          size="lg"
          variant="ghost"
          color="neutral"
          :icon="select.icon"
          @click="handleQuickSelect(select.getDate())"
        />
      </div>
      <UCalendar v-model="date" class="p-2" />

      <!-- 清除/确认 -->
      <div class="flex justify-end gap-2 border-t border-neutral-200 p-2">
        <UButton size="sm" variant="outline" color="neutral" @click="handleClear"> 清除 </UButton>
        <UButton size="sm" color="primary" @click="handleConfirm"> 确认 </UButton>
      </div>
    </template>
  </UPopover>
</template>
