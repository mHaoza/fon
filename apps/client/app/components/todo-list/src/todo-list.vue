<script setup lang="ts">
import { useTodoStore } from '~/store/todo'
import AddInput from './add-input.vue'
import { viewTemplateList } from './utils/view-template-list'

const route = useRoute()
const todoStore = useTodoStore()

const viewTemplate = computed(() => viewTemplateList.find(item => item.reg.test(route.hash))?.template)

const title = computed(() => {
  if (typeof todoStore.activeViewInfo?.title !== 'string') {
    return todoStore.activeViewInfo?.title(route)
  }
  else {
    return todoStore.activeViewInfo?.title ?? ' '
  }
})
</script>

<template>
  <div class="border-r border-gray-200/70 flex flex-col h-full">
    <div class="text-xl font-bold p-2">
      {{ title }}
    </div>
    <AddInput class="mx-2 mb-2" />

    <component :is="viewTemplate" class="px-2" />
  </div>
</template>

<style scoped></style>
