<script lang="tsx" setup>
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
        filterList: [{ open: true }],
      },
      {
        params: { is_done: true, page: 1, page_size: 50 },
        action: params => fetchGetTodoList(params),
        filterList: [{ title: '已完成', open: false }],
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
        filterList: [{ open: true }],
      },
      {
        params: { tags: [item.name], is_done: true, page: 1, page_size: 50 },
        action: params => fetchGetTodoList(params),
        filterList: [{ title: '已完成', open: false }],
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

const CollapseTitle = defineComponent({
  name: 'CollapseTitle',
  props: {
    open: { type: Boolean, required: true },
    title: { type: String, required: true },
  },
  setup(props) {
    return () => (
      <div class="group text-gray-500 p-1 rounded-md i-flex-y-center h-7 w-full hover:bg-gray-100">
        <span class={`i-mdi-chevron-right opacity-0 inline-block group-hover:opacity-100 ${props.open ? 'rotate-90' : ''}`} />
        <span class="text-xs">{props.title}</span>
      </div>
    )
  },
})
</script>

<template>
  <div>
    <SidebarGroup v-model:value="todoStore.activeFilterKey" :options="baseFilterList" @change="handleFilterChange" />
    <div class="mx-1 my-2 bg-gray-100 h-[1px]" />
    <Collapsible default-open>
      <SidebarGroup v-model:value="todoStore.activeFilterKey" :options="tagFilterList" @change="handleFilterChange">
        <template #extra="{ option }">
          <div class="rounded-full h-3 w-3" :style="{ backgroundColor: getTagColor(option.label) }" />
        </template>
      </SidebarGroup>
      <template #trigger="{ open: isOpen }">
        <CollapseTitle :open="isOpen" title="标签" />
      </template>
    </Collapsible>
  </div>
</template>
