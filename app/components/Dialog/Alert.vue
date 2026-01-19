<script setup lang="ts">
import type { AlertDialogOptions } from '~/composables/useDialog'

interface Props extends AlertDialogOptions {
  onResolve: () => void
}

const props = defineProps<Props>()

function handleClose(close: () => void) {
  props.onClose?.()
  close()
  props.onResolve()
}
</script>

<template>
  <UModal :title="title" :description="description">
    <template #footer="{ close }">
      <div class="flex w-full items-center justify-end">
        <UButton
          :label="buttonText || '确定'"
          :color="buttonColor || 'primary'"
          @click="handleClose(close)"
        />
      </div>
    </template>
  </UModal>
</template>
