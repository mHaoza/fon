import { defaultKeymap, historyKeymap } from '@codemirror/commands'
import { keymap } from '@codemirror/view'

export const customKeyMap = keymap.of([
  { key: 'Enter', run: () => true, preventDefault: true }, // 禁止换行
  ...defaultKeymap,
  ...historyKeymap,
])
