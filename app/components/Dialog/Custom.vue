<script setup lang="ts">
import type { CustomDialogOptions, DialogButton } from '~/composables/useDialog'

interface Props extends CustomDialogOptions {
  onResolve: (index: number) => void
}

const props = defineProps<Props>()

async function handleButtonClick(button: DialogButton, index: number, close: () => void) {
  await button.onClick()
  close()
  props.onResolve(index)
}
</script>

<template>
  <UModal :title="title" :description="description">
    <template v-if="content" #body>
      <component :is="content" />
    </template>
    <template v-if="buttons" #footer="{ close }">
      <div class="flex w-full items-center justify-end gap-3">
        <UButton
          v-for="(button, index) in buttons"
          :key="index"
          :label="button.label"
          :color="button.color || 'neutral'"
          :variant="button.variant || 'solid'"
          @click="handleButtonClick(button, index, close)"
        />
      </div>
    </template>
  </UModal>
</template>
