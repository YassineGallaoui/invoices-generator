<script setup lang="ts">
useSeoMeta({ title: "Settings — Invoice Generator" });

const { config, resetConfig } = useInvoiceConfig();

</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">Settings</h1>
      <button type="button" :class="$style.resetBtn" @click="resetConfig">
        Reset to defaults
      </button>
    </header>

    <ClientOnly>
      <template v-if="config">
        <!-- Font sizes -->
        <section :class="$style.section">
          <AppSectionHeading>Font Sizes (px)</AppSectionHeading>
          <div :class="$style.grid">
            <FormNumber v-model="config.baseFontPx" label="Base (body)" :min="6" :max="24" />
            <FormNumber v-model="config.preheaderTextPx" label="Preheader title" :min="6" :max="36" />
            <FormNumber v-model="config.tableHeaderPx" label="Table headers" :min="6" :max="18" />
            <FormNumber v-model="config.primaryInfoPx" label="Primary info (name)" :min="6" :max="36" />
            <FormNumber v-model="config.secondaryInfoPx" label="Secondary info" :min="6" :max="24" />
            <FormNumber v-model="config.centsPx" label="Cents superscript" :min="5" :max="16" />
          </div>
        </section>

        <!-- Header highlight color -->
        <section :class="$style.section">
          <AppSectionHeading>Header Highlight Color</AppSectionHeading>
          <p :class="$style.hint">
            Applied to section labels: FROM, TO, DESCRIPTION, QTY, PAYMENT DETAILS, NOTES, etc.
            Leave empty for no highlight.
          </p>
          <div :class="$style.colorRow">
            <div :class="$style.colorField">
              <label for="header-color" :class="$style.colorLabel">Color</label>
              <input
                id="header-color"
                type="color"
                :value="config.headerColor || '#ffffff'"
                :class="$style.colorPicker"
                @input="config.headerColor = ($event.target as HTMLInputElement).value"
              />
            </div>
            <div :class="$style.colorPreview" :style="{ backgroundColor: config.headerColor || 'transparent' }">
              <span>PREVIEW</span>
            </div>
            <button
              v-if="config.headerColor"
              type="button"
              :class="$style.clearColor"
              @click="config.headerColor = ''"
            >
              Clear
            </button>
          </div>
        </section>

        <!-- Page margins -->
        <section :class="$style.section">
          <AppSectionHeading>PDF Page Margins (pt)</AppSectionHeading>
          <p :class="$style.hint">1 point ≈ 0.35 mm. Default margins are 40 pt ≈ 14 mm.</p>
          <div :class="$style.marginsGrid">
            <div />
            <FormNumber v-model="config.marginTop" label="Top" :min="0" :max="150" />
            <div />
            <FormNumber v-model="config.marginLeft" label="Left" :min="0" :max="150" />
            <div :class="$style.marginCenter">A4</div>
            <FormNumber v-model="config.marginRight" label="Right" :min="0" :max="150" />
            <div />
            <FormNumber v-model="config.marginBottom" label="Bottom" :min="0" :max="150" />
            <div />
          </div>
        </section>
      </template>
    </ClientOnly>
  </div>
</template>

<style module lang="scss">
.page {
  padding: 2rem 2.5rem;
  max-width: 640px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}

.resetBtn {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 20%, transparent);
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  color: color-mix(in srgb, var(--foreground-color) 65%, transparent);
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover { border-color: var(--foreground-color); color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 2rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
}

.hint {
  font-size: 0.78rem;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  margin: 0;
}

// Header color picker row
.colorRow {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.colorField {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.colorLabel {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
}

.colorPicker {
  width: 56px;
  height: 36px;
  padding: 2px;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.colorPreview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35em 0.7em;
  border-radius: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #1a1a1a;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 10%, transparent);
  min-width: 80px;
}

.clearColor {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover { border-color: var(--foreground-color); color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

// 3×3 compass layout for margins
.marginsGrid {
  display: grid;
  grid-template-columns: 1fr 120px 1fr;
  grid-template-rows: auto auto auto;
  gap: 0.5rem;
  align-items: center;
  max-width: 380px;
}

.marginCenter {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1.414;
  background-color: color-mix(in srgb, var(--foreground-color) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--foreground-color) 40%, transparent);
  letter-spacing: 0.05em;
}
</style>
