<script setup lang="ts"></script>

<template>
  <div class="default-layout bg-white grid grid-cols-[1fr] grid-rows-[auto_1fr] h-screen w-screen">
    <TitleBar />
    <main class="h-full w-full overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<style scoped></style>
