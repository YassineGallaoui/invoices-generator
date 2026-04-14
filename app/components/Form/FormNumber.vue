<script setup lang="ts">
const props = defineProps<{
  modelValue: number;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  id?: string;
  hideLabel?: boolean;
}>();
const emit = defineEmits<{ "update:modelValue": [value: number] }>();

const inputId = computed(
  () => props.id ?? `form-num-${Math.random().toString(36).slice(2, 7)}`,
);
</script>

<template>
  <div :class="$style.field">
    <label :for="inputId" :class="[$style.label, hideLabel && $style.srOnly]">{{ label }}</label>
    <input
      :id="inputId"
      type="number"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step ?? 1"
      :placeholder="placeholder"
      :class="$style.input"
      @input="
        emit(
          'update:modelValue',
          parseFloat(($event.target as HTMLInputElement).value) || 0,
        )
      "
    />
  </div>
</template>

<style module lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.input {
  background-color: color-mix(in srgb, var(--foreground-color) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  border-radius: 6px;
  padding: 0.45rem 0.6rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--foreground-color);
  width: 100%;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: #ffe44d;
    box-shadow: 0 0 0 3px color-mix(in srgb, #ffe44d 30%, transparent);
  }

  // Remove spin buttons on non-webkit
  &[type="number"] {
    appearance: textfield;
  }

  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    opacity: 0.4;
  }
}
</style>
