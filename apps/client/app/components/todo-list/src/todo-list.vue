<script setup lang="ts">
import AddInput from './add-input.vue'
import { viewTemplateList } from './utils/view-template-list'

const route = useRoute()

const viewTemplate = computed(() => viewTemplateList.find(item => item.reg.test(route.hash))?.template)
</script>

<template>
  <div class="border-r border-gray-200/70 flex flex-col h-full">
    <AddInput class="mx-2 mb-2" />

    <component :is="viewTemplate" class="px-2" />
  </div>
</template>

<style scoped></style>
