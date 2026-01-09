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
  <div class="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
    <UCard class="max-w-md w-full shadow-xl">
      <div class="text-center space-y-6 py-4">
        <!-- 404 标题 -->
        <div class="space-y-4">
          <div class="relative">
            <div class="text-8xl font-extrabold bg-linear-to-r from-gray-600 via-gray-700 to-gray-800 dark:from-gray-300 dark:via-gray-400 dark:to-gray-500 bg-clip-text text-transparent">
              404
            </div>
          </div>

          <div class="flex justify-center">
            <UIcon
              name="i-heroicons-question-mark-circle"
              class="w-16 h-16 text-gray-400 dark:text-gray-600"
            />
          </div>

          <div class="space-y-2">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              页面未找到
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
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
