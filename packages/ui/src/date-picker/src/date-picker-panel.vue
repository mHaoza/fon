<script setup lang="ts">
import type * as datepicker from '@zag-js/date-picker'
import type { PropTypes } from '@zag-js/vue'

interface Props {
  view: 'day' | 'month' | 'year'
  api: datepicker.Api<PropTypes>
  title: string
  tableProps: datepicker.TableProps
  tableBodyProps: datepicker.TableProps
  tableRowProps: datepicker.TableProps
  tableHeaderProps?: datepicker.TableProps
  tableCellProps: (item: any) => any
  tableCellTriggerProps: (item: any) => any
  data: any[]
  itemKey: (item: any) => string
  itemLabel: (item: any) => string
  headerData?: string[]
  cellClass?: string
}

const props = defineProps<Props>()

function setupStyleProps(cellProps: Record<string, any>) {
  const classObj: Record<string, boolean> = {
    'rd-full i-flex-center cursor-pointer border-blue-500 transition-colors text-xs': true,
    'hover:bg-gray-100': cellProps['data-selected'] === undefined,
    'bg-blue-500 text-white hover:bg-blue-600': cellProps['data-selected'] !== undefined,
    'bg-blue-50': cellProps['data-in-range'] !== undefined,
    'border-1': cellProps['data-today'] !== undefined,
    'text-gray-400': cellProps['data-outside-range'] !== undefined,
    'opacity-40': cellProps['data-disabled'] !== undefined,
    'pointer-events-none': cellProps['data-disabled'] !== undefined,
  }
  if (props.cellClass) {
    classObj[props.cellClass] = true
  }
  return {
    ...cellProps,
    class: Object.keys(classObj).filter(key => classObj[key]).join(' '),
  }
}
</script>

<template>
  <div>
    <!-- 视图头部 -->
    <div
      v-bind="api.getViewControlProps({ view })"
      class="mb-2 flex items-center justify-between"
    >
      <button
        v-bind="api.getPrevTriggerProps({ view })"
        class="text-sm rd-6px i-flex-center size-6 hover:bg-gray-100"
      >
        <span class="i-iconoir:nav-arrow-left" />
      </button>
      <button
        v-bind="api.getViewTriggerProps({ view })"
        class="text-sm px-2 py-0.5 rd-6px hover:bg-gray-100"
      >
        {{ title }}
      </button>
      <button
        v-bind="api.getNextTriggerProps({ view })"
        class="text-sm rd-6px i-flex-center size-6 hover:bg-gray-100"
      >
        <span class="i-iconoir:nav-arrow-right" />
      </button>
    </div>

    <!-- 表格内容 -->
    <table
      v-bind="tableProps"
      class="w-full border-separate border-spacing-y-1"
    >
      <!-- 表头 -->
      <thead v-if="headerData" v-bind="tableHeaderProps" class="text-xs text-gray-500">
        <tr v-bind="tableRowProps" class="flex justify-between">
          <template v-for="(d, i) in headerData" :key="i">
            <th scope="col" class="text-xs font-medium px-1 py-0.5">
              <div :class="cellClass" class="i-flex-center">
                {{ d }}
              </div>
            </th>
          </template>
        </tr>
      </thead>

      <tbody v-bind="tableBodyProps">
        <template v-for="(row, rowIndex) in data" :key="rowIndex">
          <tr v-bind="tableRowProps" class="flex justify-between">
            <template v-for="(item) in row" :key="itemKey(item)">
              <td v-bind="tableCellProps(item)" class="py-0.5 i-flex-center">
                <div v-bind="setupStyleProps(tableCellTriggerProps(item))">
                  {{ itemLabel(item) }}
                </div>
              </td>
            </template>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
