<script setup lang="ts">
import type { InvoiceListEntry } from "~/types/invoice";

useSeoMeta({ title: "Invoices — Invoice Generator" });

const store = useInvoiceStore();
const entries = ref<InvoiceListEntry[]>([]);

onMounted(async () => {
  entries.value = await store.loadIndex();
});

async function deleteInvoice(id: string) {
  await store.remove(id);
  entries.value = entries.value.filter((e) => e.id !== id);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric"
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
</script>

<template>
  <div :class="$style.page">
    <!-- Header -->
    <header :class="$style.header">
      <div>
        <h1 :class="$style.title">Invoices</h1>
        <p :class="$style.sub">
          {{ entries.length }} invoice{{ entries.length !== 1 ? "s" : "" }}
        </p>
      </div>
      <NuxtLink to="/invoices/new" :class="$style.newBtn">
        <Icon name="ph:plus" aria-hidden="true" />
        New invoice
      </NuxtLink>
    </header>

    <ClientOnly>
      <AppAnonymousWarning :class="$style.warning" />

      <!-- Empty state -->
      <div v-if="entries.length === 0" :class="$style.empty">
        <Icon name="ph:receipt" aria-hidden="true" :class="$style.emptyIcon" />
        <p :class="$style.emptyTitle">No invoices yet</p>
        <p :class="$style.emptyText">
          Create your first invoice to get started.
        </p>
        <NuxtLink to="/invoices/new" :class="$style.newBtn">
          <Icon name="ph:plus" aria-hidden="true" />
          New invoice
        </NuxtLink>
      </div>

      <!-- Invoice list -->
      <ul v-else :class="$style.list" role="list">
        <li
          v-for="entry in entries"
          :key="entry.id"
          :class="$style.item"
        >
          <NuxtLink
            :to="`/invoices/${entry.id}`"
            :class="$style.itemLink"
          >
            <span :class="$style.itemLabel">{{ entry.label }}</span>
            <table :class="$style.itemIdentifiers">
              <tr v-if="entry.invoiceNumber" :class="$style.itemNumber">
                <td>#:</td>
                <td>{{ entry.invoiceNumber }}</td>
              </tr>
              <tr v-if="entry.id" :class="$style.itemNumber">
                <td>ID:</td>
                <td>{{ entry.id }}</td>
              </tr>
            </table>
          </NuxtLink>
          <span :class="$style.itemDate">{{ formatDate(entry.updatedAt) }}</span>
          <button
            type="button"
            :class="$style.deleteBtn"
            :aria-label="`Delete invoice ${entry.label}`"
            @click="deleteInvoice(entry.id)"
          >
            <Icon name="ph:trash" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </ClientOnly>
  </div>
</template>

<style module lang="scss">
.page {
  padding: 2rem 2.5rem;
  max-width: 760px;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.15rem;
  line-height: 1.2;
}

.sub {
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  margin: 0;
}

.newBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: #ffe44d;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s ease;

  &:hover { opacity: 0.85; }
  &:focus-visible { outline: 2px solid #1a1a1a; outline-offset: 2px; }
}

.warning {
  margin-bottom: 1.5rem;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 4rem 2rem;
  text-align: center;
}

.emptyIcon {
  font-size: 3rem;
  color: color-mix(in srgb, var(--foreground-color) 20%, transparent);
  margin-bottom: 0.5rem;
}

.emptyTitle {
  font-weight: 700;
  font-size: 1rem;
  margin: 0;
}

.emptyText {
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  margin: 0 0 0.75rem;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: color-mix(in srgb, var(--foreground-color) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 10%, transparent);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  transition: border-color 0.15s ease;

  &:hover { border-color: color-mix(in srgb, var(--foreground-color) 25%, transparent); }
}

.itemLink {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  min-width: 0;

  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; border-radius: 4px; }
}

.itemLabel {
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.itemIdentifiers{
  display: table;
  margin-left: 0.6rem;
}

.itemNumber {
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--foreground-color) 50%, transparent);
  white-space: nowrap;
}

.itemDate {
  font-size: 0.72rem;
  color: color-mix(in srgb, var(--foreground-color) 45%, transparent);
  white-space: nowrap;
  margin-left: auto;
}

.deleteBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: color-mix(in srgb, var(--foreground-color) 35%, transparent);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover { color: #d94040; background-color: color-mix(in srgb, #d94040 10%, transparent); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}
</style>
