import { BaseDirectory, exists, mkdir, readDir, remove, writeFile } from '@tauri-apps/plugin-fs'

const ROOT_DIR = 'resources'
const BASE_DIR = BaseDirectory.Resource

/** 上传文件（写入 $RESOURCE 目录） */
export async function uploadFile(request: {
  name: string
  path: string
  content: number[] // Uint8Array 转换为 number[]
}) {
  const relativePath = `${ROOT_DIR}/${request.path}`.replace(/\\/g, '/').replace(/\/\//g, '/')

  // 确保目录存在
  const dir = relativePath.includes('/') ? relativePath.substring(0, relativePath.lastIndexOf('/')) : ''
  if (dir) {
    try {
      await mkdir(dir, { baseDir: BASE_DIR, recursive: true })
    }
    catch {}
  }

  await writeFile(relativePath, new Uint8Array(request.content), { baseDir: BASE_DIR })

  return {
    name: request.name,
    path: relativePath,
  }
}

/**
 * 获取文件列表（遍历 $RESOURCE/[subPath]）
 * @param subPath 子目录
 * @example
 * const fileList = await getFileList('todos/a9105c66-fbf7-4be3-96f9-d2dac7a6448d')
 */
export async function getFileList(subPath?: string) {
  const base = subPath && subPath.length > 0 ? `${ROOT_DIR}/${subPath}` : ROOT_DIR
  const items: { name: string, path: string }[] = []

  const entries = await readDir(base, { baseDir: BASE_DIR })
  for (const entry of entries) {
    if (!entry.isFile) {
      continue
    }
    const name = entry.name || ''
    const relative = base === '.' ? name : `${base}/${name}`
    items.push({ name, path: relative })
  }

  return { files: items, total: items.length }
}

/** 删除文件 */
export async function deleteFile(path: string): Promise<void> {
  await remove(path, { baseDir: BASE_DIR })
}

/** 检查文件是否存在 */
export async function fileExists(path: string): Promise<boolean> {
  return await exists(path, { baseDir: BASE_DIR })
}

/** 将文件转换为 Uint8Array */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

/** 获取文件扩展名 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/** 简单 MIME 猜测（基于扩展名） */
export function guessMimeType(filename: string): string {
  const ext = getFileExtension(filename)
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(ext))
    return `image/${ext === 'jpg' ? 'jpeg' : ext}`
  if (['mp4', 'webm', 'ogg', 'mov', 'mkv'].includes(ext))
    return `video/${ext}`
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext))
    return `audio/${ext}`
  if (ext === 'pdf')
    return 'application/pdf'
  if (['zip', 'rar', '7z'].includes(ext))
    return 'application/zip'
  if (['txt', 'md', 'log'].includes(ext))
    return 'text/plain'
  if (['json'].includes(ext))
    return 'application/json'
  return 'application/octet-stream'
}

/** 检查是否为图片文件 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/** 检查是否为视频文件 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

/** 检查是否为音频文件 */
export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith('audio/')
}
