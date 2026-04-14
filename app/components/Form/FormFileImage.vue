<script setup lang="ts">
const props = defineProps<{
  modelValue: string; // base64 data URL
  label: string;
  maxSizeMb?: number;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const inputRef = ref<HTMLInputElement | null>(null);
const error = ref("");
const dragging = ref(false);
const maxBytes = computed(() => (props.maxSizeMb ?? 2) * 1024 * 1024);

function processFile(file: File) {
  error.value = "";
  if (!file.type.startsWith("image/")) {
    error.value = "Please upload an image file.";
    return;
  }
  if (file.size > maxBytes.value) {
    error.value = `Image must be under ${props.maxSizeMb ?? 2}MB.`;
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    emit("update:modelValue", (e.target?.result as string) ?? "");
  };
  reader.readAsDataURL(file);
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) processFile(file);
}

function onDrop(e: DragEvent) {
  dragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
}

function clearImage() {
  emit("update:modelValue", "");
  if (inputRef.value) inputRef.value.value = "";
  error.value = "";
}
</script>

<template>
  <div :class="$style.field">
    <span :class="$style.label">{{ label }}</span>

    <!-- Preview -->
    <div v-if="modelValue" :class="$style.preview">
      <img :src="modelValue" alt="Logo preview" :class="$style.previewImg" />
      <button
        type="button"
        :class="$style.remove"
        aria-label="Remove logo"
        @click="clearImage"
      >
        <Icon name="ph:x" aria-hidden="true" />
      </button>
    </div>

    <!-- Drop zone -->
    <label
      v-else
      :class="[$style.dropzone, dragging && $style.dragging]"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <Icon name="ph:image-square" aria-hidden="true" :class="$style.dropIcon" />
      <span :class="$style.dropText">
        Drop an image here or <span :class="$style.browse">browse</span>
      </span>
      <span :class="$style.hint">PNG, JPG, SVG — max {{ maxSizeMb ?? 2 }}MB</span>
      <input
        ref="inputRef"
        type="file"
        accept="image/*"
        :class="$style.hiddenInput"
        aria-label="Upload logo image"
        @change="onFileChange"
      />
    </label>

    <p v-if="error" :class="$style.error" role="alert">{{ error }}</p>
  </div>
</template>

<style module lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
}

.preview {
  position: relative;
  display: inline-flex;
  max-width: 160px;
}

.previewImg {
  max-width: 160px;
  max-height: 80px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  object-fit: contain;
  display: block;
}

.remove {
  position: absolute;
  top: -0.4rem;
  right: -0.4rem;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background-color: var(--foreground-color);
  color: var(--background-color);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  padding: 0;

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 2px;
  }
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 2px dashed color-mix(in srgb, var(--foreground-color) 20%, transparent);
  border-radius: 8px;
  padding: 1.5rem 1rem;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s ease, background-color 0.15s ease;

  &:hover,
  &:focus-within {
    border-color: #ffe44d;
    background-color: color-mix(in srgb, #ffe44d 8%, transparent);
  }
}

.dragging {
  border-color: #ffe44d;
  background-color: color-mix(in srgb, #ffe44d 12%, transparent);
}

.dropIcon {
  font-size: 1.75rem;
  color: color-mix(in srgb, var(--foreground-color) 40%, transparent);
}

.dropText {
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--foreground-color) 70%, transparent);
}

.browse {
  color: var(--foreground-color);
  text-decoration: underline;
  font-weight: 600;
}

.hint {
  font-size: 0.7rem;
  color: color-mix(in srgb, var(--foreground-color) 40%, transparent);
}

.hiddenInput {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.error {
  font-size: 0.75rem;
  color: #d94040;
  margin: 0;
}
</style>
