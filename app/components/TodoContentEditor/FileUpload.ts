import type { NodeViewRenderer } from '@tiptap/core'
import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import FileUploadNodeComponent from './FileUploadNode.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileUpload: {
      insertFileUpload: () => ReturnType
    }
  }
}

export default Node.create({
  name: 'fileUpload',
  group: 'block',
  atom: true,
  draggable: false,
  addAttributes() {
    return {}
  },
  parseHTML() {
    return [{
      tag: 'div[data-type="file-upload"]',
    }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'file-upload' })]
  },
  addNodeView(): NodeViewRenderer {
    return VueNodeViewRenderer(FileUploadNodeComponent)
  },
  addCommands() {
    return {
      insertFileUpload: () => ({ commands }) => {
        return commands.insertContent({ type: this.name })
      },
    }
  },
})
