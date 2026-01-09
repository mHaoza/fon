import type { Editor } from '@tiptap/vue-3'

export function extractTags(editor: Editor) {
  const tags: string[] = []

  editor.state.doc.descendants((node) => {
    if (node.type.name === 'tag') {
      tags.push(node.attrs.label)
    }
  })

  return tags
}
