<script setup lang="tsx">
import type { ContextMenuItem } from '@nuxt/ui'
import { UIcon } from '#components'
import { useTagStore } from '~/store/tag'

const router = useRouter()
const route = useRoute()
const tagStore = useTagStore()

type TodoNavbarValue = 'all' | `tag/${string}` | 'deleted'

function go(value: TodoNavbarValue, query?: Record<string, string>) {
  router.push({ path: `/main/todo/${value}`, query })
}

// 获取标签菜单项
function getTagMenuItems(tagId: number, tagName: string) {
  const items: ContextMenuItem[] = [
    {
      label: '删除标签',
      icon: 'i-mdi-delete',
      color: 'error',
      onSelect: async () => {
        await tagStore.deleteTag(tagId)
        // 如果当前正在查看被删除的标签，跳转到"所有"视图
        if (route.path === `/main/todo/tag/${tagName}`) {
          go('all')
        }
      },
    },
  ]
  return items
}

const TodoNavbarItem = defineComponent({
  name: 'TodoNavbarItem',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    icon: { type: String, required: true },
  },
  setup(props, { slots }) {
    const route = useRoute()
    return () => (
      <div
        class={[
          'sidebar-item px-4 py-2 rounded-md flex cursor-pointer items-center',
          route.path.replace('/main/todo/', '') === props.value ? 'bg-gray-100' : 'hover:bg-gray-100/50',
        ]}
      >
        <UIcon name={props.icon} class="text-gray mr-1" />
        <div class="text-sm flex-1">{ props.label }</div>
        <div class="sidebar-item-extra">
          { slots.extra?.() }
        </div>
      </div>
    )
  },
})
</script>

<template>
  <div class="p-2 border-r border-gray-200/70 w-46">
    <!-- 基础分组 -->
    <TodoNavbarItem label="所有" value="all" icon="i-mdi-view-grid-outline" @click="go('all')" />
    <USeparator color="neutral" class="my-2" />
    <!-- 标签分组（可折叠） -->
    <Collapsible title="标签" default-open>
      <template #content>
        <UContextMenu
          v-for="tag in tagStore.tagList"
          :key="tag.id"
          :items="getTagMenuItems(tag.id, tag.name)"
        >
          <TodoNavbarItem
            :label="tag.name"
            :value="`tag/${tag.name}`"
            icon="i-mdi-tag-outline"
            @click="go(`tag/${tag.name}`)"
          >
            <template #extra>
              <div class="rounded-full h-3 w-3" :style="{ backgroundColor: getTagColor(tag.name) }" />
            </template>
          </TodoNavbarItem>
        </UContextMenu>
      </template>
    </Collapsible>
    <USeparator color="neutral" class="my-2" />
    <!-- 已删除 -->
    <TodoNavbarItem label="已刪除" value="deleted" icon="i-mdi-delete-outline" @click="go('deleted')" />
  </div>
</template>

<style scoped></style>
