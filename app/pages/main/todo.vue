<script setup lang="ts"></script>

<template>
  <div class="flex h-full overflow-hidden">
    <TodoNavbar class="w-48" />

    <!-- todo list -->
    <NuxtPage class="flex-1 shrink-0" />

    <div class="h-full flex-1 shrink-0">
      <TodoDetail />
    </div>
  </div>
</template>

<style scoped></style>
