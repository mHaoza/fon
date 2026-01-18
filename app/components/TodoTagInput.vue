<script setup lang="ts">
import { useTagStore } from '~/store/tag'
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()
const tagStore = useTagStore()

const selectedTags = computed({
  get: () => todoStore.activeTodo?.tags ?? [],
  set: (v) => {
    if (todoStore.activeTodo) {
      todoStore.activeTodo.tags = v
      todoStore.updateTodo({ id: todoStore.activeTodo?.id, tags: v })
    }
  },
})

// 可选的建议标签
const availableTags = computed(() => tagStore.tagList.map(tag => tag.name))

// 是否显示输入框
const showInput = ref(false)

// 当前输入的值
const currentTag = ref<string>()

// InputMenu 的 ref
const inputMenuRef = ref()

function addTag(tag?: string) {
  const tagToAdd = tag || currentTag.value
  if (tagToAdd && typeof tagToAdd === 'string' && !selectedTags.value.includes(tagToAdd)) {
    selectedTags.value = [...selectedTags.value, tagToAdd]
  }
  currentTag.value = undefined
  showInput.value = false
}

function removeTag(tag: string) {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
}

function handleCreate(item: string) {
  addTag(item)
}

function handleSelect() {
  nextTick(() => {
    if (currentTag.value) {
      addTag()
    }
  })
}

// 处理失焦
function handleBlur() {
  setTimeout(() => {
    if (currentTag.value && typeof currentTag.value === 'string') {
      addTag()
    }
    else {
      showInput.value = false
    }
  }, 200)
}

watch(showInput, (newVal) => {
  if (newVal) {
    nextTick(() => {
      inputMenuRef.value?.inputRef?.focus()
    })
  }
})

const filteredItems = computed(() => {
  return availableTags.value.filter(tag => !selectedTags.value.includes(tag))
})
</script>

<template>
  <div class="inline-flex flex-wrap items-center gap-2 pl-7">
    <!-- 已选择的标签 -->
    <UBadge
      v-for="tag in selectedTags"
      :key="tag"
      color="neutral"
      variant="soft"
      class="group inline-flex items-center gap-1.5 rounded-full relative cursor-pointer"
      :style="{ backgroundColor: getTagColor(tag) }"
    >
      <span class="px-0.5 leading-2.5">{{ tag }}</span>
      <UButton
        icon="i-mdi-close-circle"
        size="xs"
        color="neutral"
        variant="link"
        :padded="false"
        :ui="{
          base: [
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full',
            'p-0 text-neutral-400 hover:text-neutral-500 active:text-neutral-600 cursor-pointer',
            'group-hover:block hidden',
          ],
        }"
        @click="removeTag(tag)"
      />
    </UBadge>

    <!-- 输入框 -->
    <UInputMenu
      v-if="showInput"
      ref="inputMenuRef"
      v-model="currentTag"
      :items="filteredItems"
      variant="none"
      placeholder="选择或输入标签..."
      create-item
      autofocus
      open-on-focus
      size="xs"
      :ui="{
        base: 'w-40 h-4.5 border border-primary rounded-full py-0.5',
        content: 'focus:ring-1 focus:ring-primary',
      }"
      @create="handleCreate"
      @update:model-value="handleSelect"
      @blur="handleBlur"
    />

    <!-- 加号按钮 -->
    <UButton
      v-else
      icon="i-lucide-plus"
      size="sm"
      color="neutral"
      variant="outline"
      :padded="false"
      :ui="{
        base: 'px-2 py-1 rounded-full cursor-pointer hover:bg-neutral-50 transition-all',
        leadingIcon: 'size-2.5',
      }"
      @click="showInput = true"
    />
  </div>
</template>
