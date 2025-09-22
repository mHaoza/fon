import type { HTMLAttributes } from 'vue'

export interface SidebarOption {
  label: string
  value: number | string
  icon?: string
  eleProps?: HTMLAttributes
  [key: string]: any
}
export interface SidebarGroupProps {
  options: SidebarOption[]
}
