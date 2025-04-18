export interface ContextMenuItem {
  label: string
  value?: string
  icon?: string
  class?: string
  disabled?: boolean
  separator?: boolean
  children?: ContextMenuItem[]
  onClick?: () => void
}

export interface ContextMenuProps {
  items: ContextMenuItem[]
  trigger?: 'contextmenu' | 'click'
}
