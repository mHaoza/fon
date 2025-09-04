<script lang="ts" setup>
import { Collapsible, SidebarGroup } from '@fon/ui'

const activeTag = ref('')
const tagOptions = [
  { label: '1111111111', value: '1111111111', icon: 'i-mdi:tag-outline' },
  { label: '222222', value: '222222', icon: 'i-mdi:tag-outline' },
  { label: '333333333', value: '333333333', icon: 'i-mdi:tag-outline' },
  { label: '44444444', value: '44444444', icon: 'i-mdi:tag-outline' },
  { label: '555555555', value: '555555555', icon: 'i-mdi:tag-outline' },
]
</script>

<template>
  <div>
    <Collapsible title="标签" default-open>
      <SidebarGroup v-model:value="activeTag" :options="tagOptions" />
    </Collapsible>
  </div>
</template>
