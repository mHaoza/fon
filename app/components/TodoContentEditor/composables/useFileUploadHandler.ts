import type { Editor } from '@tiptap/core'
import { selectFiles } from '~/utils/upload'

/** 处理文件上传 */
export async function handleFileUpload(editor: Editor, todoId: number) {
  // 打开文件选择对话框
  const selectedFiles = await selectFiles()
  if (!selectedFiles || !selectedFiles[0]) {
    return
  }

  const file = selectedFiles[0]

  try {
    // 插入带 loading 状态的文件节点
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'file',
        attrs: {
          path: '',
          name: file.name,
          loading: true,
        },
      })
      .run()

    // 上传文件
    const result = await uploadFile({
      name: file.name,
      path: `todos/${todoId}/${file.name}`,
      file,
    })

    // 上传完成后，更新最后一个文件节点
    const { state } = editor
    const { doc } = state

    // 从后往前遍历，找到最后一个加载中的文件节点
    let lastFileNodePos = -1
    doc.descendants((node, pos) => {
      if (node.type.name === 'file' && node.attrs.loading) {
        lastFileNodePos = pos
      }
    })

    // 如果找到了加载中的节点，更新它
    if (lastFileNodePos >= 0) {
      editor
        .chain()
        .updateAttributes('file', {
          path: result.path,
          name: result.name,
          loading: false,
        })
        .run()
    }
  }
  catch (error) {
    console.error('处理文件失败:', error)
    // 如果上传失败，需要移除加载中的节点
    const { state } = editor
    const { doc } = state

    let lastFileNodePos = -1
    doc.descendants((node, pos) => {
      if (node.type.name === 'file' && node.attrs.loading) {
        lastFileNodePos = pos
      }
    })

    if (lastFileNodePos >= 0) {
      editor
        .chain()
        .deleteRange({ from: lastFileNodePos, to: lastFileNodePos + 1 })
        .run()
    }
  }
}
