<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { push } = useRouter()

function goHome() {
  push('/main/todo/all')
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 p-4 dark:from-neutral-900 dark:to-neutral-950"
  >
    <UCard class="w-full max-w-md shadow-lg">
      <div class="space-y-6 py-4 text-center">
        <!-- 404 标题 -->
        <div class="space-y-4">
          <div class="relative">
            <div
              class="bg-linear-to-r from-neutral-600 via-neutral-700 to-neutral-800 bg-clip-text text-8xl font-extrabold text-transparent dark:from-neutral-300 dark:via-neutral-400 dark:to-neutral-500"
            >
              404
            </div>
          </div>

          <div class="flex justify-center">
            <UIcon
              name="i-heroicons-question-mark-circle"
              class="h-16 w-16 text-neutral-400 dark:text-neutral-600"
            />
          </div>

          <div class="space-y-2">
            <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">页面未找到</h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">您访问的页面不存在</p>
          </div>
        </div>

        <USeparator />

        <!-- 操作按钮 -->
        <div class="flex flex-wrap justify-center gap-3">
          <UButton size="lg" color="neutral" icon="i-heroicons-home" @click="goHome">
            返回首页
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
