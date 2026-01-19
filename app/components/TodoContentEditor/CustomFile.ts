import type { NodeViewRenderer } from '@tiptap/core'
import { createBlockMarkdownSpec, mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import FileNodeComponent from './FileNode.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    file: {
      insertFileNode: (attrs: { path?: string; name: string; loading?: boolean }) => ReturnType
      updateFileNode: (attrs: { path?: string; name?: string; loading?: boolean }) => ReturnType
    }
  }
}

/**
 * 创建自定义节点，用于显示文件信息
 * https://tiptap.dev/docs/editor/markdown/guides/integrate-markdown-in-your-extension
 */
export default Node.create({
  name: 'file',

  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      path: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-path'),
        renderHTML: (attributes) => ({
          'data-path': attributes.path,
        }),
      },
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-name'),
        renderHTML: (attributes) => ({
          'data-name': attributes.name,
        }),
      },
      loading: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-loading') === 'true',
        renderHTML: (attributes) => ({
          'data-loading': attributes.loading ? 'true' : 'false',
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-node"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'file-node' })]
  },

  addNodeView(): NodeViewRenderer {
    return VueNodeViewRenderer(FileNodeComponent)
  },

  addCommands() {
    return {
      insertFileNode:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              path: attrs.path || '',
              name: attrs.name,
              loading: attrs.loading ?? false,
            },
          })
        },
      updateFileNode:
        (attrs) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attrs)
        },
    }
  },

  // 使用 Pandoc 风格的 Markdown 规范
  ...createBlockMarkdownSpec({
    nodeName: 'file',
    defaultAttributes: { path: '', name: '', loading: false },
    allowedAttributes: ['path', 'name', 'loading'],
  }),
})
