<script setup lang="ts">
// Generate the UUID synchronously so we can navigate instantly —
// no layout needed, no black-screen flash, no async wait.
// useInvoice() on the [id] page will create + persist the invoice
// if it doesn't already exist.
const id = generateUUID();
await navigateTo(`/invoices/${id}`, { replace: true });
</script>

<template>
  <div />
</template>
