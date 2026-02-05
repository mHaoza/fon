<script setup lang="ts">
const windowWidth = useWindowSize().width

const middlePanelMaxSize = computed(() => {
  const maxSize = windowWidth.value - (220 + 300)
  return Math.max(maxSize, 360)
})
</script>

<template>
  <UDashboardGroup unit="px" storage="local" class="relative h-full">
    <UDashboardPanel
      id="left-panel"
      resizable
      :default-size="180"
      :min-size="140"
      :max-size="220"
      :ui="{
        root: 'w-(--width) not-last:border-e not-last:border-default',
        body: 'p-1 sm:p-1',
        handle: 'block',
      }"
    >
      <template #body>
        <TodoNavbar class="size-full" />
      </template>
    </UDashboardPanel>

    <UDashboardPanel
      id="middle-panel"
      resizable
      :default-size="480"
      :min-size="360"
      :max-size="middlePanelMaxSize"
      :ui="{
        root: 'w-(--width) not-last:border-e not-last:border-default',
        body: 'p-1 sm:p-1',
        handle: 'block',
      }"
    >
      <template #body>
        <NuxtPage />
      </template>
    </UDashboardPanel>

    <UDashboardPanel
      id="right-panel"
      :ui="{ root: 'w-(--width)', body: 'p-1 sm:p-1', handle: 'block' }"
    >
      <template #body>
        <TodoDetail />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<style scoped></style>
