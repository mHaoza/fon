export interface SidebarOption {
  label: string
  value: number | string
  icon?: string
  [key: string]: any
}
export interface SidebarGroupProps {
  options: SidebarOption[]
}
