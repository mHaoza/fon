import type { VNode } from 'vue'

export type FloatMenuPlacement
  = | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'

export interface FloatMenuItem {
  title: string | VNode
  icon?: string
  class?: string
  action?: () => void
}

export interface ShowFloatMenuOptions {
  items: FloatMenuItem[]
  position: { x: number, y: number }
  placement?: FloatMenuPlacement
}
