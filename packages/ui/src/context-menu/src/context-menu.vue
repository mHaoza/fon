<script setup lang="ts">
import type { ContextMenuProps } from './types'
import * as menu from '@zag-js/menu'
import { normalizeProps, useMachine } from '@zag-js/vue'
import { computed, useId } from 'vue'

const props = withDefaults(defineProps<ContextMenuProps>(), {
  trigger: 'contextmenu',
})

const service = useMachine(menu.machine, {
  id: useId(),
  positioning: {
    placement: 'bottom-start',
  },
})

const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <div>
    <!-- 触发区域 -->
    <div
      v-bind="props.trigger === 'contextmenu' ? api.getContextTriggerProps() : api.getTriggerProps()"
    >
      <slot />
    </div>

    <!-- 菜单内容 -->
    <Teleport to="body">
      <div v-if="api.open" v-bind="api.getPositionerProps()">
        <div
          v-bind="api.getContentProps()"
          class="py-1 outline-none border border-gray-200 rounded-lg bg-white min-w-48 shadow-lg"
          @contextmenu="(e) => e.preventDefault()"
        >
          <template v-for="(item, index) in props.items" :key="item.value || index">
            <!-- 分隔符 -->
            <div
              v-if="item.separator"
              v-bind="api.getSeparatorProps()"
              class="my-1 border-t border-gray-200"
            />

            <!-- 菜单项 -->
            <div
              v-else
              v-bind="api.getItemProps({ value: item.value || item.label })"
              class="text-sm px-3 py-2 outline-none flex cursor-pointer transition-colors items-center focus:outline-none hover:bg-gray-100 focus:shadow-none"
              :class="{ 'opacity-50 cursor-not-allowed hover:bg-transparent': item.disabled, [item.class || '']: item.class }"
              @click="item.onClick?.()"
            >
              <div class="flex w-full items-center">
                <span
                  v-if="item.icon"
                  class="mr-2 flex h-4 w-4 items-center justify-center"
                  :class="item.icon"
                />
                <span class="flex-1">{{ item.label }}</span>
                <span
                  v-if="item.children?.length"
                  class="i-mdi-chevron-right text-gray-400 ml-2"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>
