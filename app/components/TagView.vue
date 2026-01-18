<script setup lang="ts">
import { computed } from 'vue'

interface TagViewProps {
  tagList: string[]
  maxTagCount?: number
  maxTagTextLength?: number
}

const props = withDefaults(defineProps<TagViewProps>(), {
  maxTagCount: 5,
  maxTagTextLength: 10,
})

const router = useRouter()

// 截断文字
function truncateText(text: string): string {
  if (text.length <= props.maxTagTextLength) {
    return text
  }
  return `${text.slice(0, props.maxTagTextLength)}...`
}

// 可见的标签
const visibleTags = computed(() => {
  return props.tagList.slice(0, props.maxTagCount)
})

// 剩余的标签
const remainingTags = computed(() => {
  return props.tagList.slice(props.maxTagCount)
})

function switchTagList(tag: string) {
  router.push({ path: `/main/todo/tag/${tag}`,
  })
}
</script>

<template>
  <div class="flex flex-wrap gap-1.5 items-center" @click.stop>
    <div
      v-for="(tag, index) in visibleTags"
      :key="index"
      class="text-xs text-neutral-700 leading-none px-2.5 py-1 border border-neutral-200 rounded-full inline-flex max-w-30 cursor-pointer whitespace-nowrap items-center overflow-hidden transition-all hover:opacity-80 hover:scale-105"
      :style="{ backgroundColor: getTagColor(tag) }"
      :title="tag.length > maxTagTextLength ? tag : ''"
      @click="switchTagList(tag)"
    >
      {{ truncateText(tag) }}
    </div>

    <div
      v-if="remainingTags.length > 0"
      class="text-xs text-neutral-600 leading-none font-medium px-2.5 py-1 border border-neutral-200 rounded-full bg-neutral-50 inline-flex cursor-pointer items-center hover:bg-neutral-100 transition-all"
      :title="remainingTags.join(', ')"
    >
      +{{ remainingTags.length }}
    </div>
  </div>
</template>
