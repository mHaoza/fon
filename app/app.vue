<script setup lang="ts">
import { initAllDatabases } from '~/db'

// 初始化数据库
onMounted(async () => {
  try {
    await initAllDatabases()
    console.log('Database initialized successfully')
  }
  catch (error) {
    console.error('Failed to initialize database:', error)
  }
})
</script>

<template>
  <Provider>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Provider>
</template>
