<script setup lang="ts">
import * as scrollArea from '@zag-js/scroll-area'
import { normalizeProps, useMachine } from '@zag-js/vue'
import { computed, useId } from 'vue'

const service = useMachine(scrollArea.machine, {
  id: useId(),
})

const api = computed(() => scrollArea.connect(service, normalizeProps))
</script>

<template>
  <div
    v-bind="api.getRootProps()"
    class="scroll-area-container h-full w-full relative overflow-hidden"
  >
    <div v-bind="api.getViewportProps()" class="h-full w-full overflow-auto">
      <div v-bind="api.getContentProps()" class="min-h-full min-w-full">
        <slot />
      </div>
    </div>
    <div v-bind="api.getScrollbarProps()" class="scrollbar bg-transparent absolute">
      <div v-bind="api.getThumbProps()" class="rounded bg-black/30 relative" />
    </div>
  </div>
</template>

<style scoped>
[data-orientation="vertical"] {
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
}

[data-orientation="horizontal"] {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6px;
}

[data-scope="scroll-area"][data-part="viewport"]::-webkit-scrollbar {
  display: none;
}

/* 默认隐藏滚动条 */
.scrollbar {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

/* 悬停时显示滚动条 */
[data-overflow-y].scroll-area-container:hover .scrollbar,
[data-overflow-y].scrollbar:active {
  opacity: 1;
}
</style>
