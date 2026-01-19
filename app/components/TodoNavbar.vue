<script setup lang="tsx">
import type { ContextMenuItem } from '@nuxt/ui'
import { UIcon } from '#components'
import { getTodoList } from '~/db/todos'
import { useTagStore } from '~/store/tag'

const router = useRouter()
const route = useRoute()
const tagStore = useTagStore()
const dialog = useDialog()

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
        // 判断是否存在任务使用该标签
        const hasTodos = await getTodoList({ tags: [tagName] })
        if (hasTodos.total > 0) {
          // 有关联的 todo，需要用户确认
          dialog.confirm({
            title: '确认删除标签',
            description: `标签 "${tagName}" 正在被 ${hasTodos.total} 个待办使用，删除后这些待办的标签也会被移除。`,
            confirmText: '确认删除',
            cancelText: '取消',
            confirmColor: 'error',
            onConfirm: async () => {
              await deleteTag(tagId, tagName)
            },
          })
        } else {
          // 没有关联的 todo，直接删除
          await deleteTag(tagId, tagName)
        }
      },
    },
  ]
  return items
}

async function deleteTag(tagId: number, tagName: string) {
  await tagStore.deleteTag(tagId)
  // 如果当前正在查看被删除的标签，跳转到"所有"视图
  if (route.path === `/main/todo/tag/${tagName}`) {
    go('all')
  }
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
          'sidebar-item flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors',
          route.path.replace('/main/todo/', '') === props.value
            ? 'bg-primary-50 text-primary'
            : 'text-neutral-700 hover:bg-neutral-50',
        ]}
      >
        <UIcon name={props.icon} class="text-current" />
        <div class="flex-1 text-sm">{props.label}</div>
        <div class="sidebar-item-extra">{slots.extra?.()}</div>
      </div>
    )
  },
})
</script>

<template>
  <div class="w-46 border-r border-neutral-200 p-3">
    <!-- 基础分组 -->
    <TodoNavbarItem label="所有" value="all" icon="i-mdi-view-grid-outline" @click="go('all')" />
    <USeparator color="neutral" class="my-3" />
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
              <div
                class="h-3 w-3 rounded-full"
                :style="{ backgroundColor: getTagColor(tag.name) }"
              />
            </template>
          </TodoNavbarItem>
        </UContextMenu>
      </template>
    </Collapsible>
    <USeparator color="neutral" class="my-3" />
    <!-- 已删除 -->
    <TodoNavbarItem
      label="已刪除"
      value="deleted"
      icon="i-mdi-delete-outline"
      @click="go('deleted')"
    />
  </div>
</template>

<style scoped></style>
