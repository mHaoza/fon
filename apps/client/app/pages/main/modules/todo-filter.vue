<script lang="ts" setup>
import { Collapsible, SidebarGroup } from '@fon/ui'
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()

const tagList = computed(() => todoStore.tagList.map(item => ({
  label: item.name,
  value: `tag:${item.name}`,
  icon: 'i-mdi-tag-outline',
  filterInfo: {
    activeKey: `tag:${item.name}`,
    params: { tags: [item.name] },
  },
})))
</script>

<template>
  <div>
    <Collapsible title="标签" default-open>
      <SidebarGroup v-model:value="todoStore.filterInfo.activeKey" :options="tagList" @change="todoStore.filterInfo.params = $event.filterInfo.params">
        <template #extra="{ option }">
          <div class="rounded-full h-3 w-3" :style="{ backgroundColor: getTagColor(option.label) }" />
        </template>
      </SidebarGroup>
    </Collapsible>
  </div>
</template>
