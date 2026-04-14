<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  label: string;
  options: { value: string; label: string }[];
  id?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const selectId = computed(
  () => props.id ?? `form-sel-${Math.random().toString(36).slice(2, 7)}`,
);
</script>

<template>
  <div :class="$style.field">
    <label :for="selectId" :class="$style.label">{{ label }}</label>
    <div :class="$style.wrapper">
      <select
        :id="selectId"
        :value="modelValue"
        :class="$style.select"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
        >{{ opt.label }}</option>
      </select>
      <Icon name="ph:caret-down" aria-hidden="true" :class="$style.caret" />
    </div>
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

.wrapper {
  position: relative;
}

.select {
  appearance: none;
  background-color: color-mix(in srgb, var(--foreground-color) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  border-radius: 6px;
  padding: 0.45rem 2rem 0.45rem 0.6rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--foreground-color);
  width: 100%;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: #ffe44d;
    box-shadow: 0 0 0 3px color-mix(in srgb, #ffe44d 30%, transparent);
  }
}

.caret {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--foreground-color) 50%, transparent);
}
</style>
