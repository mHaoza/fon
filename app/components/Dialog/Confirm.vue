<script setup lang="tsx">
import type { ConfirmDialogOptions } from '~/composables/useDialog'

interface Props extends ConfirmDialogOptions {
  onResolve: (value: boolean) => void
}

const props = defineProps<Props>()

const isLoading = ref(false)

async function handleConfirm(close: () => void) {
  if (isLoading.value)
    return

  isLoading.value = true
  try {
    await props.onConfirm?.()
    close()
    props.onResolve(true)
  }
  catch (error) {
    console.error('Confirm failed:', error)
  }
  finally {
    isLoading.value = false
  }
}

function handleCancel(close: () => void) {
  props.onCancel?.()
  close()
  props.onResolve(false)
}
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :dismissible="!isLoading"
  >
    <template #footer="{ close }">
      <div class="flex items-center justify-end gap-3 w-full">
        <UButton
          :label="cancelText || '取消'"
          color="neutral"
          variant="outline"
          :disabled="isLoading"
          @click="handleCancel(close)"
        />
        <UButton
          :label="confirmText || '确认'"
          :color="confirmColor || 'primary'"
          :loading="isLoading"
          @click="handleConfirm(close)"
        />
      </div>
    </template>
  </UModal>
</template>
