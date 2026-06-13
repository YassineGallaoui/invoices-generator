<script setup lang="ts">
import type { Invoice } from "~/types/invoice";
import InvoiceFooterTable from "./InvoiceFooterTable.vue";
import InvoiceItemsTable from "./InvoiceItemsTable.vue";
import InvoicePartiesTable from "./InvoicePartiesTable.vue";
import InvoicePreheaderTable from "./InvoicePreheaderTable.vue";

defineProps<{
  invoice: Invoice;
  zoom?: number; // 0.5 – 2, default 1
}>();
</script>

<template>
  <div :class="$style.viewport">
    <div :style="{ zoom: zoom ?? 1 }">
    <div
      :class="[$style.paper, 'invoice-preview']"
      :style="{
        paddingTop: `calc(${invoice.config.marginTop} * 0.75px)`,
        paddingRight: `calc(${invoice.config.marginRight} * 0.75px)`,
        paddingBottom: `calc(${invoice.config.marginBottom} * 0.75px)`,
        paddingLeft: `calc(${invoice.config.marginLeft} * 0.75px)`,
        // Override the root-level vars (set from the global Settings config)
        // so the preview always reflects THIS invoice's config.
        '--inv-base-px': String(invoice.config.baseFontPx),
        '--inv-header-color': invoice.config.headerColor || 'transparent',
      }"
    >
      <!-- Preheader sits outside the flex body -->
      <InvoicePreheaderTable
        :preheader="invoice.preheader"
        :config="invoice.config"
      />

      <!-- Flex body: content at top, footer pinned to bottom -->
      <div :class="$style.body">
        <div :class="$style.content">
          <div :class="$style.parties">
            <InvoicePartiesTable
              :from="invoice.from"
              :to="invoice.to"
              :config="invoice.config"
            />
          </div>
          <div>
            <InvoiceItemsTable
              v-for="section in invoice.items"
              :key="section.id"
              :section="section"
              :config="invoice.config"
            />
          </div>
        </div>

        <InvoiceFooterTable
          :payment="invoice.payment"
          :notes-html="invoice.notesHtml"
          :config="invoice.config"
        />
      </div>
    </div>
    </div>
  </div>
</template>

<style module lang="scss">
// Outer viewport: gray background, scrollable
.viewport {
  background-color: color-mix(in srgb, var(--foreground-color) 6%, transparent);
  min-height: 100%;
  padding: 2rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
}

// The white "paper" — fixed A4 ratio (1:1.414); CSS zoom on the wrapper handles scaling
.paper {
  background: #ffffff;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.08),
    0 4px 24px rgba(0, 0, 0, 0.12);
  width: 680px;
  aspect-ratio: 1 / 1.414;
  box-sizing: border-box;
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// Fills remaining height after the preheader
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
}

.parties{
  margin-bottom: 6em;
}

// Parties + Items — stays at the top of the body
.content {
  display: flex;
  flex-direction: column;
}
</style>
