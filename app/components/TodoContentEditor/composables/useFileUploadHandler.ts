import type { Editor } from '@tiptap/core'
import { selectFiles } from '~/utils/upload'

/** 找到并更新最后一个加载中的文件节点 */
function updateLastFileNode(editor: Editor, attrs?: Record<string, any>) {
  let lastPos = -1
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'file' && node.attrs.loading) {
      lastPos = pos
    }
  })

  if (lastPos === -1) {
    return
  }

  if (attrs) {
    editor.chain().updateAttributes('file', attrs).run()
  } else {
    editor
      .chain()
      .deleteRange({ from: lastPos, to: lastPos + 1 })
      .run()
  }
}

/** 找到并更新最后一个没有 src 的图片节点 */
function updateLastImageNode(editor: Editor, attrs?: Record<string, any>) {
  let lastPos = -1
  let lastNode: any = null

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'image' && !node.attrs.src) {
      lastPos = pos
      lastNode = node
    }
  })

  if (lastPos === -1 || !lastNode) {
    return
  }

  const tr = editor.state.tr
  if (attrs) {
    tr.setNodeMarkup(lastPos, undefined, { ...lastNode.attrs, ...attrs })
  } else {
    tr.delete(lastPos, lastPos + 1)
  }
  editor.view.dispatch(tr)
}

/** 上传文件 */
async function uploadFileNode(editor: Editor, todoId: number, file: File) {
  try {
    // 插入加载中的文件节点
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'file',
        attrs: { path: '', name: file.name, loading: true },
      })
      .run()

    // 上传文件
    const result = await uploadFile({ path: `todos/${todoId}`, file })

    // 更新节点
    updateLastFileNode(editor, {
      path: result.path,
      name: file.name,
      loading: false,
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    updateLastFileNode(editor) // 删除失败的节点
  }
}

/** 上传图片 */
async function uploadImageNode(editor: Editor, todoId: number, file: File) {
  try {
    // 插入加载中的图片节点
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'image',
        attrs: { src: '', alt: file.name, loading: true },
      })
      .run()

    // 上传图片
    const result = await uploadFile({ path: `todos/${todoId}`, file })

    // 更新节点
    updateLastImageNode(editor, {
      src: result.path,
      alt: file.name,
    })
  } catch (error) {
    console.error('图片上传失败:', error)
    updateLastImageNode(editor) // 删除失败的节点
  }
}

/** 处理文件上传 */
export async function handleFileUpload(editor: Editor, todoId: number) {
  const files = await selectFiles()
  if (files?.[0]) {
    await uploadFileNode(editor, todoId, files[0])
  }
}

/** 处理图片上传 */
export async function handleImageUpload(editor: Editor, todoId: number) {
  const files = await selectFiles({ accept: 'image/*' })
  if (files?.[0]) {
    await uploadImageNode(editor, todoId, files[0])
  }
}

/** 处理拖拽上传 */
export async function handleDropUpload(editor: Editor, todoId: number, event: DragEvent) {
  const file = event.dataTransfer?.files?.[0]
  if (!file) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  if (file.type.startsWith('image/')) {
    await uploadImageNode(editor, todoId, file)
  } else {
    await uploadFileNode(editor, todoId, file)
  }
}

/** 处理粘贴上传 */
export async function handlePasteUpload(editor: Editor, todoId: number, event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) {
    return
  }

  let file: File | null = null
  for (const item of Array.from(items)) {
    if (item.kind === 'file') {
      file = item.getAsFile()
      if (file) {
        break
      }
    }
  }

  if (!file) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  if (file.type.startsWith('image/')) {
    await uploadImageNode(editor, todoId, file)
  } else {
    await uploadFileNode(editor, todoId, file)
  }
}
