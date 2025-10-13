<script setup lang="ts">
import { computed } from 'vue'

type CheckboxValue = boolean | number | string | null | undefined

const props = withDefaults(defineProps<{
  trueValue?: CheckboxValue
  falseValue?: CheckboxValue
  disabled?: boolean
  color?: 'blue' | 'green' | 'purple' | 'red' | 'gray'
}>(), {
  trueValue: true,
  falseValue: false,
  disabled: false,
  color: 'blue',
})

const emit = defineEmits<{
  (e: 'change', value: CheckboxValue, event: Event): void
}>()

const modelValue = defineModel<CheckboxValue>({})

const isChecked = computed(() => modelValue.value === props.trueValue)

function handleChange(event: Event) {
  if (props.disabled) {
    return
  }
  const nextValue = isChecked.value ? props.falseValue : props.trueValue
  modelValue.value = nextValue
  emit('change', nextValue, event)
}
</script>

<template>
  <label class="f-checkbox" :class="props.color">
    <input type="checkbox" :checked="isChecked" :disabled="props.disabled" @change="handleChange">
    <div class="f-checkbox-wrapper">
      <div class="f-checkbox-bg" />
      <svg fill="none" viewBox="0 0 24 24" class="f-checkbox-icon">
        <path
          stroke-linejoin="round"
          stroke-linecap="round"
          stroke-width="3"
          stroke="currentColor"
          d="M4 12L10 18L20 6"
          class="f-check-path"
        />
      </svg>
    </div>
  </label>
</template>

<style scoped>
.f-checkbox {
  --checkbox-size: 16px;
  --checkbox-color: #3b82f6;
  --checkbox-bg: #dbeafe;
  --checkbox-border: #93c5fd;

  position: relative;
  display: inline-block;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.f-checkbox input {
  display: none;
}

.f-checkbox-wrapper {
  position: relative;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.f-checkbox-bg {
  position: absolute;
  inset: 0;
  border-radius: 4px;
  border: 2px solid var(--checkbox-border);
  background: white;
  transition: all 0.2s ease;
}

.f-checkbox-icon {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 80%;
  height: 80%;
  color: white;
  transform: scale(0);
  transition: all 0.2s ease;
}

.f-check-path {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  transition: stroke-dashoffset 0.3s ease 0.1s;
}

/* Checked State */
.f-checkbox input:checked + .f-checkbox-wrapper .f-checkbox-bg {
  background: var(--checkbox-color);
  border-color: var(--checkbox-color);
}

.f-checkbox input:checked + .f-checkbox-wrapper .f-checkbox-icon {
  transform: scale(1);
}

.f-checkbox input:checked + .f-checkbox-wrapper .f-check-path {
  stroke-dashoffset: 0;
}

/* Focus Styles */
.f-checkbox input:focus + .f-checkbox-wrapper .f-checkbox-bg {
  box-shadow: 0 0 0 4px var(--checkbox-bg);
}

/* Color Themes */
.f-checkbox.blue {
  --checkbox-color: #3b82f6;
  --checkbox-bg: #dbeafe;
  --checkbox-border: #93c5fd;
}

.f-checkbox.green {
  --checkbox-color: #10b981;
  --checkbox-bg: #d1fae5;
  --checkbox-border: #6ee7b7;
}

.f-checkbox.purple {
  --checkbox-color: #8b5cf6;
  --checkbox-bg: #ede9fe;
  --checkbox-border: #c4b5fd;
}

.f-checkbox.red {
  --checkbox-color: #ef4444;
  --checkbox-bg: #fee2e2;
  --checkbox-border: #fca5a5;
}

.f-checkbox.gray {
  --checkbox-color: #d7d7d7;
  --checkbox-bg: #f9fafb;
  --checkbox-border: #cbd5e0;
}
</style>
