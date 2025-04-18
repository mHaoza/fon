<script setup lang="ts">
import type * as datepicker from '@zag-js/date-picker'
import type { PropTypes } from '@zag-js/vue'
import DatePickerPanel from './date-picker-panel.vue'

defineProps<{ api: datepicker.Api<PropTypes> }>()
</script>

<template>
  <DatePickerPanel
    v-show="api.view === 'day'"
    view="day"
    :api="api"
    :title="api.visibleRangeText.start"
    :table-props="api.getTableProps({ view: 'day' })"
    :table-body-props="api.getTableBodyProps({ view: 'day' })"
    :table-row-props="api.getTableRowProps({ view: 'day' })"
    :table-header-props="api.getTableHeaderProps({ view: 'day' })"
    :table-cell-props="(item) => api.getDayTableCellProps({ value: item })"
    :table-cell-trigger-props="(item) => api.getDayTableCellTriggerProps({ value: item })"
    :data="api.weeks"
    :item-key="(item) => `${item.year}-${item.month}-${item.day}`"
    :item-label="(item) => item.day"
    :header-data="['日', '一', '二', '三', '四', '五', '六']"
    cell-class="size-7"
  />
  <DatePickerPanel
    v-show="api.view === 'month'"
    view="month"
    :api="api"
    :title="String(api.visibleRange.start.year)"
    :table-props="api.getTableProps({ view: 'month', columns: 4 })"
    :table-body-props="api.getTableBodyProps({ view: 'month' })"
    :table-row-props="api.getTableRowProps()"
    :table-cell-props="(item) => api.getMonthTableCellProps({ ...item, columns: 4 })"
    :table-cell-trigger-props="(item) => api.getMonthTableCellTriggerProps({ ...item, columns: 4 })"
    :data="api.getMonthsGrid({ columns: 4, format: 'short' })"
    :item-key="(item) => item.label"
    :item-label="(item) => item.label"
    cell-class="size-8"
  />
  <DatePickerPanel
    v-show="api.view === 'year'"
    view="year"
    :api="api"
    :title="`${api.getDecade().start} - ${api.getDecade().end}`"
    :table-props="api.getTableProps({ view: 'year', columns: 4 })"
    :table-body-props="api.getTableBodyProps()"
    :table-row-props="api.getTableRowProps({ view: 'year' })"
    :table-cell-props="(item) => api.getYearTableCellProps({ ...item, columns: 4 })"
    :table-cell-trigger-props="(item) => api.getYearTableCellTriggerProps({ ...item, columns: 4 })"
    :data="api.getYearsGrid({ columns: 4 })"
    :item-key="(item) => item.label"
    :item-label="(item) => item.label"
    cell-class="size-9"
  />
</template>
