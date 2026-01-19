import { resolveResource } from '@tauri-apps/api/path'
import { BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs'
import Database from '@tauri-apps/plugin-sql'

const DB_DIR = 'data/db'
const DB_NAME = 'fon.db'

// 初始化数据库目录
async function ensureDbDirectory() {
  try {
    // 确保 data/db 目录存在
    const dirExists = await exists(DB_DIR, { baseDir: BaseDirectory.Resource })
    if (!dirExists) {
      await mkdir(DB_DIR, { baseDir: BaseDirectory.Resource, recursive: true })
    }
  } catch (error) {
    console.error('Failed to create database directory:', error)
    throw error
  }
}

// 获取数据库路径
async function getDbPath(): Promise<string> {
  await ensureDbDirectory()
  // 使用 Resource 目录作为基础目录
  const dbPath = await resolveResource(`${DB_DIR}/${DB_NAME}`)
  return `sqlite:${dbPath}`
}

// 导出数据库实例
export const db = await Database.load(await getDbPath())

// 初始化所有数据库
export async function initAllDatabases() {
  // 引入各数据库初始化函数
  const { initTodosDb } = await import('./todos')
  const { initTagsDb } = await import('./tags')

  // 执行初始化
  await initTodosDb()
  await initTagsDb()
}
