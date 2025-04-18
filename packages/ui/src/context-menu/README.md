# ContextMenu 右键菜单组件

基于 @zag-js/menu 封装的右键菜单组件，支持自定义触发方式和菜单项。

## 基本用法

```vue
<script setup>
import { ContextMenu } from '@/packages/ui'

const menuItems = [
  {
    id: 'copy',
    label: '复制',
    icon: '📋',
    onClick: () => console.log('复制')
  },
  {
    id: 'paste',
    label: '粘贴',
    icon: '📄',
    onClick: () => console.log('粘贴')
  },
  {
    id: 'separator',
    separator: true
  },
  {
    id: 'delete',
    label: '删除',
    icon: '🗑️',
    onClick: () => console.log('删除')
  }
]
</script>

<template>
  <ContextMenu :items="menuItems">
    <div class="p-4 bg-gray-100">
      右键点击这里显示菜单
    </div>
  </ContextMenu>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | `ContextMenuItem[]` | `[]` | 菜单项列表 |
| trigger | `'contextmenu' \| 'click'` | `'contextmenu'` | 触发方式 |

## ContextMenuItem 类型

```typescript
interface ContextMenuItem {
  id: string // 唯一标识
  label: string // 显示文本
  icon?: string // 图标
  disabled?: boolean // 是否禁用
  separator?: boolean // 是否为分隔符
  children?: ContextMenuItem[] // 子菜单项（暂未实现）
  onClick?: () => void // 点击回调
}
```

## 特性

- ✅ 支持右键和左键触发
- ✅ 支持图标显示
- ✅ 支持禁用状态
- ✅ 支持分隔符
- ✅ 自动定位到鼠标位置
- ✅ 点击外部自动关闭
- ⏳ 子菜单支持（待实现）

## 样式定制

组件使用 Tailwind CSS 类名，可以通过覆盖 CSS 变量或类名来自定义样式。
