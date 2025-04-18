<script setup lang="ts">
import * as datepicker from '@zag-js/date-picker'
import { getLocaleDir } from '@zag-js/i18n-utils'
import { normalizeProps, useMachine } from '@zag-js/vue'
import dayjs from 'dayjs'
import { computed, useId, watch } from 'vue'
import DatePickerPanels from './date-picker-panels.vue'

const props = withDefaults(defineProps<{ panel?: boolean }>(), {
  panel: false,
})

const modelValue = defineModel<number | null>('value', { default: null })

// 使用中文本地化与中国时区
const locale = 'zh-CN'
const service = useMachine(datepicker.machine, {
  defaultValue: modelValue.value ? [datepicker.parse(dayjs.unix(modelValue.value).format('YYYY-MM-DD'))] : [],
  id: useId(),
  inline: props.panel,
  locale,
  dir: getLocaleDir?.(locale) ?? 'ltr',
  startOfWeek: 0,
  outsideDaySelectable: true,
  onValueChange: (details) => {
    modelValue.value = dayjs(details.valueAsString[0]).unix()
  },
})
const api = computed(() => datepicker.connect(service, normalizeProps))

// 监听 modelValue 变化并更新日期选择器
watch(modelValue, (newValue) => {
  if (newValue !== null) {
    const dateString = dayjs.unix(newValue).format('YYYY-MM-DD')
    api.value.setValue([datepicker.parse(dateString)])
  }
})
</script>

<template>
  <div
    v-if="!panel"
    v-bind="api.getControlProps()"
    class="text-sm text-gray-700 px-2 py-1.5 border border-gray-200 rd-8px bg-white i-flex-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
  >
    <input
      v-bind="api.getInputProps()"
      class="text-sm outline-none bg-transparent flex-1 placeholder:text-gray-400"
    >
    <button
      v-bind="api.getTriggerProps()"
      class="text-sm text-gray-600 rd-6px i-flex-center size-7 transition-colors hover:bg-gray-100"
    >
      🗓
    </button>
  </div>
  <DatePickerPanels v-if="panel" :api="api" />
  <Teleport v-else to="body">
    <div v-bind="api.getPositionerProps()" class="z-50">
      <div
        v-bind="api.getContentProps()"
        class="text-sm text-gray-700 p-2 border border-gray-200 rd-10px bg-white min-w-60 select-none shadow-lg"
      >
        <DatePickerPanels :api="api" />
      </div>
    </div>
  </Teleport>
</template>
