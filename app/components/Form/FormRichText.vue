<script setup lang="ts">
const props = defineProps<{
  modelValue: string; // sanitized HTML
  label: string;
  placeholder?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const editorRef = ref<HTMLDivElement | null>(null);

// Sync modelValue → DOM only when it differs (avoid caret jump)
watch(
  () => props.modelValue,
  (val) => {
    if (editorRef.value && editorRef.value.innerHTML !== val) {
      editorRef.value.innerHTML = val;
    }
  },
);

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue;
    // Tell Chrome/Edge to use <p> instead of <div> for Enter-key line breaks.
    document.execCommand("defaultParagraphSeparator", false, "p");
  }
});

function onInput() {
  const html = editorRef.value?.innerHTML ?? "";
  emit("update:modelValue", sanitizeHtml(html));
}

function execCmd(cmd: string, value?: string) {
  editorRef.value?.focus();
  document.execCommand(cmd, false, value);
}

const tools = [
  { cmd: "bold", icon: "ph:text-b", label: "Bold" },
  { cmd: "italic", icon: "ph:text-italic", label: "Italic" },
  { cmd: "underline", icon: "ph:text-underline", label: "Underline" },
  { cmd: "insertUnorderedList", icon: "ph:list-bullets", label: "Bullet list" },
  { cmd: "insertOrderedList", icon: "ph:list-numbers", label: "Numbered list" },
];
</script>

<template>
  <div :class="$style.field">
    <span :class="$style.label">{{ label }}</span>
    <div :class="$style.editor">
      <div :class="$style.toolbar" role="toolbar" aria-label="Text formatting">
        <button
          v-for="tool in tools"
          :key="tool.cmd"
          type="button"
          :class="$style.toolBtn"
          :aria-label="tool.label"
          @mousedown.prevent="execCmd(tool.cmd)"
        >
          <Icon :name="tool.icon" aria-hidden="true" />
        </button>
      </div>
      <div
        ref="editorRef"
        :class="$style.content"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        :aria-label="label"
        :data-placeholder="placeholder ?? 'Add notes…'"
        @input="onInput"
      />
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

.editor {
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  border-radius: 6px;
  overflow: hidden;

  &:focus-within {
    border-color: #ffe44d;
    box-shadow: 0 0 0 3px color-mix(in srgb, #ffe44d 30%, transparent);
  }
}

.toolbar {
  display: flex;
  gap: 0.15rem;
  padding: 0.3rem 0.4rem;
  border-bottom: 1px solid
    color-mix(in srgb, var(--foreground-color) 10%, transparent);
  background-color: color-mix(in srgb, var(--foreground-color) 4%, transparent);
}

.toolBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: color-mix(in srgb, var(--foreground-color) 70%, transparent);
  transition: background-color 0.12s ease, color 0.12s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--foreground-color) 10%, transparent);
    color: var(--foreground-color);
  }

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 1px;
  }
}

.content {
  padding: 0.5rem 0.6rem;
  min-height: 6rem;
  font-size: 0.85rem;
  font-family: inherit;
  line-height: 1.55;
  color: var(--foreground-color);
  background-color: color-mix(in srgb, var(--foreground-color) 5%, transparent);

  &:focus {
    outline: none;
  }

  &:empty::before {
    content: attr(data-placeholder);
    color: color-mix(in srgb, var(--foreground-color) 35%, transparent);
    pointer-events: none;
  }
}
</style>
