<script setup lang="ts">
import { Collapsible, SidebarGroup } from '@fon/ui'
import { useTodoStore } from '~/store/todo'

useHead({ title: 'Fon-main' })

const todoStore = useTodoStore()

const baseMenuList = [
  {
    label: '所有',
    value: '#all',
    icon: 'i-mdi-view-grid-outline',
    eleProps: { id: 'all' },
  },
]

const tagMenuList = computed(() => todoStore.tagList.map(item => ({
  label: item.name,
  value: `#tag/${item.name}`,
  icon: 'i-mdi-tag-outline',
  eleProps: { id: `tag/${item.name}` },
})))

const otherMenuList = [
  {
    label: '已刪除',
    value: '#deleted',
    icon: 'i-mdi-delete-outline',
    eleProps: { id: 'deleted' },
  },
]

const router = useRouter()

function go(value: string | number | null) {
  if (value === '/files') {
    router.push('/files')
  }
  else {
    router.push({ path: '/main/tasks', hash: value?.toString() })
  }
}

// 初始路由
if (!router.currentRoute.value.hash) {
  go(baseMenuList[0]!.value)
}
</script>

<template>
  <div class="p-4 flex h-full overflow-hidden">
    <div class="pr-2 border-r border-gray-200/70 w-46">
      <!-- 基础分组 -->
      <SidebarGroup :value="$route.hash" :options="baseMenuList" @change="go" />
      <div class="mx-1 my-2 bg-gray-100 h-[1px]" />
      <!-- 标签分组（可折叠） -->
      <Collapsible default-open>
        <SidebarGroup :value="$route.hash" :options="tagMenuList" @change="go">
          <template #extra="{ option }">
            <div class="rounded-full h-3 w-3" :style="{ backgroundColor: getTagColor(option.label) }" />
          </template>
        </SidebarGroup>
        <template #trigger="{ open }">
          <div class="group text-gray-500 p-1 rounded-md i-flex-y-center h-7 w-full hover:bg-gray-100">
            <span class="i-mdi-chevron-right opacity-0 inline-block group-hover:opacity-100" :class="open ? 'rotate-90' : ''" />
            <span class="text-xs">标签</span>
          </div>
        </template>
      </Collapsible>
      <div class="mx-1 my-2 bg-gray-100 h-[1px]" />
      <!-- 其他视图 -->
      <SidebarGroup :value="$route.hash" :options="otherMenuList" @change="go" />
    </div>

    <div class="flex-1 h-full">
      <NuxtPage />
    </div>
  </div>
</template>

<style scoped></style>
