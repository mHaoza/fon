import type { NodeViewRenderer } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageNodeComponent from './ImageNode.vue'

// 扩展 Image 扩展，使用自定义 Vue 组件渲染
export default Image.extend({
  addNodeView(): NodeViewRenderer {
    return VueNodeViewRenderer(ImageNodeComponent)
  },
})
