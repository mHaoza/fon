import { join, resourceDir } from '@tauri-apps/api/path'
import { fileExists } from './file'

/**
 * 获取资源完整 URL
 * @param relativePath 相对路径
 * @returns 完整的资源 URL
 * @example
 * const url = await getAssetUrl('todos/123/document.pdf')
 * // => 'http://asset.localhost/D:/projects/fon/todos/123/document.pdf'
 */
export async function getAssetUrl(relativePath: string): Promise<string> {
  const dir = await resourceDir()
  const normalized = dir.replace(/\\/g, '/')
  const parent = normalized.replace(/\/?resources\/?$/, '')
  return `http://asset.localhost/${parent}/${relativePath}`
}

/**
 * 解析文件路径
 * - 如果是网络路径（http/https）或 base64 数据（data:），直接返回
 * - 如果是本地相对路径，转换为资源 URL
 * @param src 文件源路径
 * @returns 解析后的完整 URL
 * @example
 * await resolveFileSrc('http://example.com/file.pdf') // => 'http://example.com/file.pdf'
 * await resolveFileSrc('data:image/png;base64,...') // => 'data:image/png;base64,...'
 * await resolveFileSrc('todos/123/document.pdf') // => 'http://asset.localhost/...'
 */
export async function resolveFileSrc(src: string): Promise<string> {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src
  }

  return await getAssetUrl(src)
}

/**
 * 获取本地文件的绝对路径
 * @param relativePath 相对路径
 * @returns 本地文件的绝对路径
 * @example
 * const path = await getLocalFilePath('todos/123/document.pdf')
 * // => 'D:\\projects\\fon\\todos\\123\\document.pdf'
 */
export async function getLocalFilePath(relativePath: string): Promise<string> {
  const dir = await resourceDir()
  // 获取上级目录（去除 resources 目录）
  const normalizedDir = dir.replace(/[\\/]?resources[\\/]?$/, '')
  // 使用 Tauri 的 join 工具进行跨平台路径拼接
  const fullPath = await join(normalizedDir, relativePath)
  return fullPath
}

/**
 * 规范化路径（统一使用正斜杠）
 * @param path 路径
 * @returns 规范化后的路径
 * @example
 * normalizePath('todos\\123\\file.txt') // => 'todos/123/file.txt'
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/')
}

/**
 * 生成带冲突解决的文件名
 * 如果文件已存在，在文件名后添加 _1, _2 等
 * @param originalName 原始文件名
 * @param targetDir 目标目录路径（相对于 resources 目录）
 * @returns 最终的文件名
 * @example
 * await generateFilenameWithConflictResolution('photo.jpg', 'todos/123')
 * // 如果 photo.jpg 不存在 => 'photo.jpg'
 * // 如果 photo.jpg 存在 => 'photo_1.jpg'
 * // 如果 photo_1.jpg 也存在 => 'photo_2.jpg'
 */
export async function generateFilenameWithConflictResolution(
  originalName: string,
  targetDir: string,
): Promise<string> {
  // 分离文件名和扩展名
  const lastDotIndex = originalName.lastIndexOf('.')
  const nameWithoutExt = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName
  const ext = lastDotIndex > 0 ? originalName.substring(lastDotIndex) : ''

  // 检查原始文件名是否存在
  const originalPath = `resources/${targetDir}/${originalName}`.replace(/\\/g, '/').replace(/\/\//g, '/')
  const originalExists = await fileExists(originalPath)

  if (!originalExists) {
    return originalName
  }

  // 如果存在，尝试添加 _1, _2 等
  let counter = 1
  while (true) {
    const newFilename = `${nameWithoutExt}_${counter}${ext}`
    const newPath = `resources/${targetDir}/${newFilename}`.replace(/\\/g, '/').replace(/\/\//g, '/')
    const exists = await fileExists(newPath)

    if (!exists) {
      return newFilename
    }

    counter++

    // 安全限制：避免无限循环
    if (counter > 1000) {
      // 如果超过1000次，回退到时间戳方式
      const timestamp = Date.now()
      return `${nameWithoutExt}_${timestamp}${ext}`
    }
  }
}

/**
 * 判断路径是否为网络 URL
 * @param path 路径
 * @returns 是否为网络 URL
 */
export function isNetworkUrl(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://')
}

/**
 * 判断路径是否为 base64 数据 URL
 * @param path 路径
 * @returns 是否为 base64 数据 URL
 */
export function isDataUrl(path: string): boolean {
  return path.startsWith('data:')
}

/**
 * 判断路径是否为本地相对路径
 * @param path 路径
 * @returns 是否为本地相对路径
 */
export function isLocalPath(path: string): boolean {
  return !isNetworkUrl(path) && !isDataUrl(path)
}
