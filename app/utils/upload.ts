import { mkdir, writeFile } from '@tauri-apps/plugin-fs'
import { useSettingStore } from '~/store/setting'
import { generateFilenameWithConflictResolution } from './path'

/** 上传文件（写入 $RESOURCE 目录） */
export async function uploadFile(options: {
  name: string
  path: string
  file: File
}) {
  const settingStore = useSettingStore()
  const content = await fileToUint8Array(options.file)
  const relativePath = `${settingStore.RESOURCE_DIR}/${options.path}`.replace(/\\/g, '/').replace(/\/\//g, '/')

  // 确保目录存在
  const dir = relativePath.includes('/') ? relativePath.substring(0, relativePath.lastIndexOf('/')) : ''
  if (dir) {
    try {
      await mkdir(dir, { baseDir: settingStore.BASE_DIR, recursive: true })
    }
    catch {}
  }

  await writeFile(relativePath, content, { baseDir: settingStore.BASE_DIR })

  return {
    name: options.name,
    path: `/${relativePath}`,
  }
}

/** 上传文件到指定目录 */
export async function uploadFiles(files: File[], options: { baseDir: string }) {
  const fileArray = Array.isArray(files) ? files : [files]
  const results: { name: string, path: string }[] = []

  for (const file of fileArray) {
    const filename = await generateFilenameWithConflictResolution(file.name, options.baseDir)

    // 上传文件到本地
    const result = await uploadFile({
      name: file.name,
      path: `${options.baseDir}/${filename}`,
      file,
    })

    results.push(result)
  }

  return results
}

/** 打开文件选择对话框 */
export async function selectFiles(
  options: {
  /** 接受的文件类型，例如 'image/*' 或 '.pdf,.doc' */
    accept?: string
    /** 是否允许多选 */
    multiple?: boolean
  } = {},
): Promise<File[] | null> {
  return new Promise((resolve) => {
    // 创建一个隐藏的 file input 元素
    const input = document.createElement('input')
    input.type = 'file'
    input.style.display = 'none'

    if (options.accept) {
      input.accept = options.accept
    }

    if (options.multiple) {
      input.multiple = true
    }

    // 用于标记是否已处理（选择或取消）
    let isHandled = false

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const selectedFiles = target.files

      if (!selectedFiles || selectedFiles.length === 0) {
        cleanup()
        resolve(null)
        return
      }

      cleanup()
      resolve(Array.from(selectedFiles))
    }

    // 监听 cancel 事件（部分浏览器支持）
    input.oncancel = () => {
      cleanup()
      resolve(null)
    }

    // 将 input 添加到 DOM 并触发点击
    document.body.appendChild(input)
    input.click()

    // 监听窗口焦点变化（作为取消操作的后备方案）
    window.addEventListener('focus', handleWindowFocus)

    // 清理函数
    function cleanup() {
      if (!isHandled) {
        isHandled = true
        if (document.body.contains(input)) {
          document.body.removeChild(input)
        }
        window.removeEventListener('focus', handleWindowFocus)
      }
    }

    // 处理窗口重新获得焦点（用户可能点击了取消）
    function handleWindowFocus() {
      // 延迟检查，确保 change 事件有机会先触发
      setTimeout(() => {
        if (!isHandled) {
          cleanup()
          resolve(null)
        }
      }, 300)
    }
  })
}

/** 打开文件选择对话框并上传文件 */
export async function selectAndUploadFile(options: { accept?: string, multiple?: boolean, baseDir: string }) {
  const selectedFiles = await selectFiles(options)

  if (!selectedFiles) {
    return null
  }

  try {
    return await uploadFiles(selectedFiles, options)
  }
  catch (error) {
    console.error('上传文件失败:', error)
    return null
  }
}
