import { Plugin, PluginKey } from '@tiptap/pm/state'
import { InputRule, mergeAttributes, Node } from '@tiptap/vue-3'

export interface TagOptions {
  char: string
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tag: {
      setTag: (attributes: { label: string, id?: string }) => ReturnType
    }
  }
}

export const Tag = Node.create<TagOptions>({
  name: 'tag',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addOptions() {
    return {
      char: '#',
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label)
            return {}
          return { 'data-label': attributes.label }
        },
      },
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id)
            return {}
          return { 'data-id': attributes.id }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: `span[data-type="tag"]` }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': 'tag', 'class': 'tag' },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      `${this.options.char}${node.attrs.label}`,
    ]
  },

  renderText({ node }) {
    return `${this.options.char}${node.attrs.label}`
  },

  addCommands() {
    return {
      setTag:
        (attributes: { label: string, id?: string }) =>
          ({ commands }: { commands: any }) => {
            return commands.insertContent({
              type: this.name,
              attrs: attributes,
            })
          },
    }
  },

  addKeyboardShortcuts() {
    return {
      // Backspace：删除整个 tag 节点
      Backspace: ({ editor }: { editor: any }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // 检查光标前是否是 tag 节点
        if (selection.empty && $from.nodeBefore?.type.name === 'tag') {
          return editor.commands.command(({ tr }: { tr: any }) => {
            const pos = $from.pos - ($from.nodeBefore?.nodeSize ?? 0)
            tr.delete(pos, $from.pos)
            return true
          })
        }

        return false
      },
      // Delete：删除整个 tag 节点
      Delete: ({ editor }: { editor: any }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // 检查光标后是否是 tag 节点
        if (selection.empty && $from.nodeAfter?.type.name === 'tag') {
          return editor.commands.command(({ tr }: { tr: any }) => {
            tr.delete($from.pos, $from.pos + ($from.nodeAfter?.nodeSize ?? 0))
            return true
          })
        }

        return false
      },
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: new RegExp(`${this.options.char}([^\\s${this.options.char}]+)\\s$`),
        handler: ({ state, range, match }) => {
          const tagLabel = match[1]
          if (!tagLabel)
            return null

          const { tr } = state
          const start = range.from
          const end = range.to

          if (start < 0 || end > state.doc.content.size || start >= end) {
            return null
          }

          // 检查匹配范围内是否已经有 tag 节点，如果有则不处理
          let hasTagNode = false
          state.doc.nodesBetween(start, end, (node: any) => {
            if (node.type.name === 'tag') {
              hasTagNode = true
              return false // 停止遍历
            }
          })

          if (hasTagNode) {
            return null
          }

          const tagType = state.schema.nodes.tag
          if (!tagType)
            return null

          tr.delete(start, end)
          const tagNode = tagType.create({
            label: tagLabel,
            id: tagLabel,
          })
          tr.insert(start, tagNode)
          tr.insertText(' ', start + 1)
        },
      }),
    ]
  },

  // 添加插件处理 tag 后的空格删除问题
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tagSpaceHandler'),
        props: {
          handleKeyDown: (view: any, event: KeyboardEvent) => {
            if (event.key !== 'Backspace')
              return false

            const { state } = view
            const { selection } = state
            const { $from } = selection

            // 如果光标在空格上，且前面是 tag，删除空格和 tag
            if (selection.empty && $from.nodeBefore?.isText) {
              const textBefore = $from.nodeBefore.text
              if (textBefore?.endsWith(' ')) {
                const posBeforeSpace = $from.pos - 1
                const $posBeforeSpace = state.doc.resolve(posBeforeSpace)

                if ($posBeforeSpace.nodeBefore?.type.name === 'tag') {
                  // 删除 tag 和空格
                  const tagStart = posBeforeSpace - $posBeforeSpace.nodeBefore.nodeSize
                  view.dispatch(
                    state.tr.delete(tagStart, $from.pos),
                  )
                  return true
                }
              }
            }

            return false
          },
        },
      }),
    ]
  },
})

export function useTagInput(char: string = '#') {
  return Tag.configure({ char })
}
