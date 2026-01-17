import * as tagsDb from '~/db/tags'
import { useTodoStore } from './todo'

export const useTagStore = defineStore('tag', () => {
  const route = useRoute()
  const todoStore = useTodoStore()
  const { data: tagList, refresh: refreshTagList } = useAsyncData('tagList', tagsDb.getTagList, {
    default: () => [],
  })

  /** 删除标签 */
  async function deleteTag(tagId: number) {
    try {
      await tagsDb.deleteTag(tagId)
      refreshTagList()
      // 刷新所有待办列表，因为标签已从相关的 todo 中移除
      todoStore.todos.undone.refresh({ tags: [route.params.tagName as string] })
      todoStore.todos.done.refresh({ tags: [route.params.tagName as string] })
    }
    catch (error) {
      console.error('删除标签失败:', error)
      throw error
    }
  }

  return {
    tagList,
    refreshTagList,
    deleteTag,
  }
})
