<script setup lang="ts"></script>

<template>
  <div class="default-layout grid h-screen w-screen grid-cols-[1fr] grid-rows-[auto_1fr] bg-white">
    <TitleBar />
    <main class="h-full w-full overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<style scoped></style>
