import { BaseDirectory } from '@tauri-apps/plugin-fs'

export const useSettingStore = defineStore('setting', () => {
  const RESOURCE_DIR = 'resources'
  const BASE_DIR = BaseDirectory.Resource
  return {
    RESOURCE_DIR,
    BASE_DIR,
  }
})
