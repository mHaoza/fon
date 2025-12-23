<script setup lang="ts">
import type { FloatMenuItem } from '@fon/ui'
import { Collapsible, showFloatMenu, SidebarGroup } from '@fon/ui'
import { useTodoStore } from '~/store/todo'

useHead({ title: 'Fon-main' })

const router = useRouter()
const route = useRoute()
const todoStore = useTodoStore()

const baseMenuList = [
  {
    label: '所有',
    value: '#all',
    icon: 'i-mdi-view-grid-outline',
    eleProps: { id: 'all' },
  },
]

const otherMenuList = [
  {
    label: '已刪除',
    value: '#deleted',
    icon: 'i-mdi-delete-outline',
    eleProps: { id: 'deleted' },
  },
]

function go(value: string | number | null) {
  if (value === '/files') {
    router.push('/files')
  }
  else {
    router.push({ path: '/main/tasks', hash: value?.toString() })
  }
}

// 删除标签
async function handleDeleteTag(tagId: number, tagName: string) {
  try {
    await todoStore.deleteTag(tagId)
    // 如果当前正在查看被删除的标签，跳转到"所有"视图
    if (route.hash === `#tag/${tagName}`) {
      go(baseMenuList[0]!.value)
    }
  }
  catch (error) {
    console.error('删除标签失败:', error)
  }
}

// 获取标签菜单项
function getTagMenuItems(tagId: number, tagName: string): FloatMenuItem[] {
  return [
    {
      title: '删除标签',
      icon: 'i-mdi-delete',
      class: 'text-red-500',
      action: async () => {
        await handleDeleteTag(tagId, tagName)
      },
    },
  ]
}

// 打开标签右键菜单
function openTagContextMenu(e: MouseEvent, tagId: number, tagName: string) {
  e.preventDefault()
  showFloatMenu({
    items: getTagMenuItems(tagId, tagName),
    position: { x: e.clientX, y: e.clientY },
  })
}

// 初始路由
if (!router.currentRoute.value.hash) {
  go(baseMenuList[0]!.value)
}
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <div class="p-2 border-r border-gray-200/70 w-46">
      <!-- 基础分组 -->
      <SidebarGroup :value="$route.hash" :options="baseMenuList" @change="go" />
      <div class="mx-1 my-2 bg-gray-100 h-[1px]" />
      <!-- 标签分组（可折叠） -->
      <Collapsible default-open>
        <div class="sidebar-group">
          <div
            v-for="tag in todoStore.tagList"
            :key="tag.id"
            class="sidebar-item px-4 py-2 rounded-md flex cursor-pointer items-center"
            :class="{
              'bg-gray-100': $route.hash === `#tag/${tag.name}`,
              'hover:bg-gray-100/50': $route.hash !== `#tag/${tag.name}`,
            }"
            @click="go(`#tag/${tag.name}`)"
            @contextmenu="(e) => openTagContextMenu(e, tag.id, tag.name)"
          >
            <span class="i-mdi-tag-outline text-gray mr-1" />
            <div class="text-sm flex-1">
              {{ tag.name }}
            </div>
            <div>
              <div class="rounded-full h-3 w-3" :style="{ backgroundColor: getTagColor(tag.name) }" />
            </div>
          </div>
        </div>
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
