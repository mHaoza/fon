<script lang="ts" setup>
import type { SidebarOption } from '@fon/ui'
import type { TodoListFilterInfo } from '~/types'
import { Collapsible, SidebarGroup } from '@fon/ui'
import { fetchGetTodoList } from '~/services/todo'
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()

interface FilterOption extends SidebarOption {
  value: string
  filterInfoList: TodoListFilterInfo[]
}

const baseFilterList: FilterOption[] = [
  {
    label: '所有',
    value: 'all',
    icon: 'i-mdi-view-dashboard-outline',
    filterInfoList: [
      {
        params: { is_done: false },
        action: params => fetchGetTodoList(params),
      },
      {
        params: { is_done: true, page: 1, page_size: 50 },
        action: params => fetchGetTodoList(params),
        filterList: [{ title: '已完成' }],
      },
    ],
  },
]

const tagFilterList = computed(() => {
  const data: FilterOption[] = todoStore.tagList.map(item => ({
    label: item.name,
    value: `tag:${item.name}`,
    icon: 'i-mdi-tag-outline',
    filterInfoList: [
      {
        params: { tags: [item.name], is_done: false },
        action: params => fetchGetTodoList(params),
      },
      {
        params: { tags: [item.name], is_done: true, page: 1, page_size: 50 },
        action: params => fetchGetTodoList(params),
        filterList: [{ title: '已完成' }],
      },
    ],
  }))
  return data
})

function handleFilterChange(option: FilterOption) {
  todoStore.filterInfoList = option.filterInfoList
}

todoStore.activeFilterKey = 'all'
todoStore.filterInfoList = baseFilterList[0]!.filterInfoList
</script>

<template>
  <div>
    <SidebarGroup v-model:value="todoStore.activeFilterKey" :options="baseFilterList" @change="handleFilterChange" />
    <div class="mx-1 my-2 bg-gray-100 h-[1px]" />
    <Collapsible title="标签" default-open>
      <SidebarGroup v-model:value="todoStore.activeFilterKey" :options="tagFilterList" @change="handleFilterChange">
        <template #extra="{ option }">
          <div class="rounded-full h-3 w-3" :style="{ backgroundColor: getTagColor(option.label) }" />
        </template>
      </SidebarGroup>
    </Collapsible>
  </div>
</template>
