import { join, resourceDir } from '@tauri-apps/api/path'

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
