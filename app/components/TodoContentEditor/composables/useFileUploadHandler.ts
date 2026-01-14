import type { Editor } from '@tiptap/core'
import { selectFiles } from '~/utils/upload'

interface UploadConfig {
  nodeType: 'file' | 'image'
  accept?: string
  insertAttrs: (fileName: string) => Record<string, any>
  updateAttrs: (result: any) => Record<string, any>
  shouldUpdate: (node: any) => boolean
  errorMessage: string
}

/** 通用的上传处理函数 */
async function handleUpload(editor: Editor, todoId: number, config: UploadConfig) {
  // 打开文件选择对话框
  const selectedFiles = await selectFiles(config.accept ? { accept: config.accept } : undefined)
  if (!selectedFiles || !selectedFiles[0]) {
    return
  }

  const file = selectedFiles[0]

  try {
    // 插入带 loading 状态的节点
    editor
      .chain()
      .focus()
      .insertContent({
        type: config.nodeType,
        attrs: config.insertAttrs(file.name),
      })
      .run()

    // 上传文件
    const result = await uploadFile({ path: `todos/${todoId}`, file })

    // 上传完成后，更新最后一个节点
    const { state } = editor
    const { doc } = state

    // 从后往前遍历，找到最后一个需要更新的节点
    let lastNodePos = -1
    let lastNode: any = null
    doc.descendants((node, pos) => {
      if (node.type.name === config.nodeType && config.shouldUpdate(node)) {
        lastNodePos = pos
        lastNode = node
      }
    })

    // 如果找到了节点，更新它
    if (lastNodePos >= 0) {
      if (config.nodeType === 'file') {
        editor
          .chain()
          .updateAttributes('file', config.updateAttrs({ name: file.name, path: result.path }))
          .run()
      }
      else if (lastNode) {
        const tr = editor.state.tr
        tr.setNodeMarkup(lastNodePos, undefined, {
          ...lastNode.attrs,
          ...config.updateAttrs({ name: file.name, path: result.path }),
        })
        editor.view.dispatch(tr)
      }
    }
  }
  catch (error) {
    console.error(config.errorMessage, error)
    // 如果上传失败，需要移除加载中的节点
    const { state } = editor
    const { doc } = state

    let lastNodePos = -1
    doc.descendants((node, pos) => {
      if (node.type.name === config.nodeType && config.shouldUpdate(node)) {
        lastNodePos = pos
      }
    })

    if (lastNodePos >= 0) {
      if (config.nodeType === 'file') {
        editor
          .chain()
          .deleteRange({ from: lastNodePos, to: lastNodePos + 1 })
          .run()
      }
      else {
        const tr = editor.state.tr
        tr.delete(lastNodePos, lastNodePos + 1)
        editor.view.dispatch(tr)
      }
    }
  }
}

/** 处理文件上传 */
export async function handleFileUpload(editor: Editor, todoId: number) {
  await handleUpload(editor, todoId, {
    nodeType: 'file',
    insertAttrs: fileName => ({
      path: '',
      name: fileName,
      loading: true,
    }),
    updateAttrs: result => ({
      path: result.path,
      name: result.name,
      loading: false,
    }),
    shouldUpdate: node => node.attrs.loading,
    errorMessage: '处理文件失败:',
  })
}

/** 处理图片上传 */
export async function handleImageUpload(editor: Editor, todoId: number) {
  await handleUpload(editor, todoId, {
    nodeType: 'image',
    accept: 'image/*',
    insertAttrs: fileName => ({
      src: '',
      alt: fileName,
      loading: true,
    }),
    updateAttrs: result => ({
      src: result.path,
      alt: result.name,
    }),
    shouldUpdate: node => !node.attrs.src,
    errorMessage: '处理图片失败:',
  })
}
