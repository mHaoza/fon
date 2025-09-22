import type { PaginationListResponse, Todo, TodoListQuery } from '~/types'

export function useTodoList(
  getListFn: (data: TodoListQuery) => Promise<PaginationListResponse<Todo>>,
  queryInfo?: TodoListQuery,
  extraQueryInfo?: ComputedRef<TodoListQuery>,
) {
  const list = ref<Todo[]>([])
  const query = ref(defaultQuery())
  const total = ref(Infinity)

  function defaultQuery() {
    return {
      ...queryInfo,
      ...extraQueryInfo?.value,
    }
  }

  async function refresh() {
    query.value = defaultQuery()
    const result = await getListFn(query.value)

    list.value = result.data
    total.value = result.total
  }

  async function loadMore() {
    if (
      !query.value.page
      || !query.value.page_size
      || query.value.page * query.value.page_size >= total.value
    ) {
      return
    }

    query.value.page++
    const result = await getListFn({
      ...query.value,
      page: query.value.page,
      page_size: query.value.page_size,
    })

    list.value = [...list.value, ...result.data]
    total.value = result.total
  }

  return {
    list,
    total,
    refresh,
    loadMore,
  }
}
