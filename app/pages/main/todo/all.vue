<script setup lang="ts">
import type { Todo } from '~/types'
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()
todoStore.todos.undone.refresh()
todoStore.todos.done.refresh()

const doneCollapsible = ref(false)
const list = computed(() => {
  const list: (Todo | { itemType: 'done' })[] = [...todoStore.todos.undone.list]
  if (todoStore.todos.done.list.length > 0) {
    list.push({ itemType: 'done' })
  }
  if (doneCollapsible.value) {
    list.push(...todoStore.todos.done.list)
  }
  return list
})
</script>

<template>
  <div class="border-r border-gray-200/70 flex flex-col h-full">
    <div class="text-xl font-bold p-2">
      所有
    </div>
    <TodoAddInput />

    <UScrollArea virtualize :items="list" item-key="id" class="[scrollbar-gutter:stable]">
      <template #default="{ item }">
        <Collapsible
          v-if="'itemType' in item && item.itemType === 'done'"
          v-model:open="doneCollapsible"
          title="已完成"
          class="my-2"
        >
          <template #triggerExtra>
            <span class="text-xs text-gray-500 font-medium ml-2">
              {{ todoStore.todos.done.list.length }}
            </span>
          </template>
        </Collapsible>
        <TodoListItem v-else :todo="(item as Todo)" />
      </template>
    </UScrollArea>
  </div>
</template>
