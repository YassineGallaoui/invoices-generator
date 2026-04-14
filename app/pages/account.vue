<script setup lang="ts">
definePageMeta({ title: "Account" });

const { user } = useUserSession();

// Redirect if not logged in
if (!user.value) await navigateTo("/login");

// Server data: created_at + last_login_at
const { data: me } = await useFetch("/api/auth/me");

// Client-side stats from localStorage (loaded after mount)
const { presets } = usePresets();
const store = useInvoiceStore();

const invoiceCount = ref(0);
const clientCount = computed(() => presets.value.clients.length);
const businessCount = computed(() => presets.value.businesses.length);

onMounted(async () => {
  const list = await store.loadIndex();
  invoiceCount.value = list.length;
});

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">Account</h1>
    </header>

    <!-- Profile card -->
    <section :class="$style.card" aria-label="Profile">
      <div :class="$style.avatar" aria-hidden="true">
        {{ (user?.email ?? "?")[0]!.toUpperCase() }}
      </div>
      <div :class="$style.profile">
        <p :class="$style.email">{{ user?.email }}</p>
        <p :class="$style.meta">
          Member since {{ formatDate(me?.createdAt) }}
        </p>
      </div>
    </section>

    <!-- Stats -->
    <section aria-label="Your stats">
      <h2 :class="$style.sectionTitle">Stats</h2>
      <div :class="$style.stats">
        <ClientOnly>
          <div :class="$style.stat">
            <span :class="$style.statValue">{{ invoiceCount }}</span>
            <span :class="$style.statLabel">Invoices</span>
          </div>
          <div :class="$style.stat">
            <span :class="$style.statValue">{{ clientCount }}</span>
            <span :class="$style.statLabel">Clients</span>
          </div>
          <div :class="$style.stat">
            <span :class="$style.statValue">{{ businessCount }}</span>
            <span :class="$style.statLabel">Businesses</span>
          </div>
          <template #fallback>
            <div :class="$style.stat">
              <span :class="$style.statValue">—</span>
              <span :class="$style.statLabel">Invoices</span>
            </div>
            <div :class="$style.stat">
              <span :class="$style.statValue">—</span>
              <span :class="$style.statLabel">Clients</span>
            </div>
            <div :class="$style.stat">
              <span :class="$style.statValue">—</span>
              <span :class="$style.statLabel">Businesses</span>
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>

    <!-- Last login -->
    <section aria-label="Login activity">
      <h2 :class="$style.sectionTitle">Last login</h2>
      <div :class="$style.card">
        <div :class="$style.loginRow">
          <Icon name="ph:clock" aria-hidden="true" :class="$style.loginIcon" />
          <span :class="$style.loginDate">{{ formatDate(me?.lastLoginAt) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style module lang="scss">
.page {
  max-width: 560px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
}

/* Section heading */
.sectionTitle {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--foreground-color) 45%, transparent);
  margin: 0 0 0.75rem;
}

/* Generic card */
.card {
  background-color: color-mix(in srgb, var(--foreground-color) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 10%, transparent);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Profile */
.avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: #ffe44d;
  color: #1a1a1a;
  font-size: 1.375rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.profile {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
}

.email {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  font-size: 0.8125rem;
  margin: 0;
  color: color-mix(in srgb, var(--foreground-color) 50%, transparent);
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat {
  background-color: color-mix(in srgb, var(--foreground-color) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 10%, transparent);
  border-radius: 14px;
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  text-align: center;
}

.statValue {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.statLabel {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--foreground-color) 50%, transparent);
}

/* Last login */
.loginRow {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.loginIcon {
  font-size: 1.125rem;
  color: color-mix(in srgb, var(--foreground-color) 45%, transparent);
  flex-shrink: 0;
}

.loginDate {
  font-size: 0.9375rem;
  font-weight: 500;
}
</style>
