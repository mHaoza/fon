import type { Component } from 'vue'
import { LazyDialogAlert, LazyDialogConfirm, LazyDialogCustom } from '#components'

export interface DialogButton {
  label: string
  color?: 'primary' | 'error' | 'neutral' | 'success' | 'warning'
  variant?: 'solid' | 'outline' | 'ghost'
  onClick: () => void | Promise<void>
}

export interface ConfirmDialogOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: DialogButton['color']
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

export interface AlertDialogOptions {
  title: string
  description?: string
  buttonText?: string
  buttonColor?: DialogButton['color']
  onClose?: () => void
}

export interface CustomDialogOptions {
  title: string
  description?: string
  content?: Component
  buttons?: DialogButton[]
}

export function useDialog() {
  /**
   * 快捷方法：确认对话框
   */
  function confirm(options: ConfirmDialogOptions) {
    return new Promise<boolean>((resolve) => {
      const overlay = useOverlay()
      const modal = overlay.create(LazyDialogConfirm)

      modal.open({
        ...options,
        onResolve: (value: boolean) => resolve(value),
      })
    })
  }

  /**
   * 快捷方法：警告对话框
   */
  function alert(options: AlertDialogOptions) {
    return new Promise<void>((resolve) => {
      const overlay = useOverlay()
      const modal = overlay.create(LazyDialogAlert)

      modal.open({
        ...options,
        onResolve: () => resolve(),
      })
    })
  }

  /**
   * 打开一个自定义对话框
   */
  function open(options: CustomDialogOptions) {
    return new Promise<number>((resolve) => {
      const overlay = useOverlay()
      const modal = overlay.create(LazyDialogCustom)

      modal.open({
        ...options,
        onResolve: (index: number) => resolve(index),
      })
    })
  }

  return {
    confirm,
    alert,
    open,
  }
}
