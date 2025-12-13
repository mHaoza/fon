import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import type { TodoListQuery } from '~/types'
import ViewTemplateDeleted from '../view-templates/view-template-deleted.vue'
import ViewTemplateNormal from '../view-templates/view-template-normal.vue'

interface ViewTemplate {
  title: string | ((route: RouteLocationNormalizedLoadedGeneric) => string)
  reg: RegExp
  template: typeof ViewTemplateNormal
  query: (route: RouteLocationNormalizedLoadedGeneric) => TodoListQuery
}

export const viewTemplateList: ViewTemplate[] = [
  {
    title: '所有',
    reg: /^#all/,
    template: ViewTemplateNormal,
    query: () => ({}),
  },
  {
    title: (route: RouteLocationNormalizedLoadedGeneric) => `#${route.hash.split('/')[1]}`,
    reg: /^#tag/,
    template: ViewTemplateNormal,
    query: (route: RouteLocationNormalizedLoadedGeneric) => ({ tags: [`${route.hash?.split('/')[1]}`] }),
  },
  {
    title: '已刪除',
    reg: /^#deleted/,
    template: ViewTemplateDeleted,
    query: () => ({}),
  },
]
