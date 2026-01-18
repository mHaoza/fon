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
  <div class="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
    <UCard class="max-w-md w-full shadow-lg">
      <div class="text-center space-y-6 py-4">
        <!-- 404 标题 -->
        <div class="space-y-4">
          <div class="relative">
            <div class="text-8xl font-extrabold bg-linear-to-r from-neutral-600 via-neutral-700 to-neutral-800 dark:from-neutral-300 dark:via-neutral-400 dark:to-neutral-500 bg-clip-text text-transparent">
              404
            </div>
          </div>

          <div class="flex justify-center">
            <UIcon
              name="i-heroicons-question-mark-circle"
              class="w-16 h-16 text-neutral-400 dark:text-neutral-600"
            />
          </div>

          <div class="space-y-2">
            <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">
              页面未找到
            </h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              您访问的页面不存在
            </p>
          </div>
        </div>

        <USeparator />

        <!-- 操作按钮 -->
        <div class="flex gap-3 justify-center flex-wrap">
          <UButton
            size="lg"
            color="neutral"
            icon="i-heroicons-home"
            @click="goHome"
          >
            返回首页
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
