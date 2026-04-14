<script setup lang="ts">
import AppSidebarLink from "./AppSidebarLink.vue";

const links = [
  { to: "/", icon: "ph:files", label: "Invoices" },
  { to: "/presets", icon: "ph:stack", label: "Presets" },
  { to: "/settings", icon: "ph:gear", label: "Settings" },
];

const { loggedIn, user, clear } = useUserSession();

const menuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
}

async function logout() {
  closeMenu();
  await $fetch("/api/auth/logout", { method: "POST" });
  await clear();
  await navigateTo("/login");
}

// Close on outside click
onMounted(() => {
  document.addEventListener("click", onOutsideClick);
});
onUnmounted(() => {
  document.removeEventListener("click", onOutsideClick);
});
function onOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    closeMenu();
  }
}
</script>

<template>
  <nav :class="$style.sidebar" aria-label="Main navigation">
    <NuxtLink to="/" :class="$style.brand" aria-label="Invoice Generator home">
      <Icon name="ph:receipt" aria-hidden="true" :class="$style.brandIcon" />
    </NuxtLink>

    <ul :class="$style.links" role="list">
      <li v-for="link in links" :key="link.to">
        <AppSidebarLink :to="link.to" :icon="link.icon" :label="link.label" />
      </li>
    </ul>

    <!-- Auth section at the bottom -->
    <div :class="$style.auth">
      <template v-if="loggedIn">
        <div ref="menuRef" :class="$style.menuWrap">
          <button
            :class="$style.avatarBtn"
            :aria-expanded="menuOpen"
            aria-haspopup="menu"
            :aria-label="`Account menu for ${user?.email ?? 'user'}`"
            :title="user?.email ?? 'Account'"
            @click="toggleMenu"
          >
            {{ (user?.email ?? "?")[0]!.toUpperCase() }}
          </button>

          <Transition name="popup">
            <div
              v-if="menuOpen"
              :class="$style.popup"
              role="menu"
              aria-label="Account menu"
            >
              <div :class="$style.popupEmail">{{ user?.email }}</div>
              <div :class="$style.popupDivider" />
              <NuxtLink
                to="/account"
                :class="$style.popupItem"
                role="menuitem"
                @click="closeMenu"
              >
                <Icon name="ph:user-circle" aria-hidden="true" />
                Account settings
              </NuxtLink>
              <button
                :class="[$style.popupItem, $style.popupItemDanger]"
                role="menuitem"
                @click="logout"
              >
                <Icon name="ph:sign-out" aria-hidden="true" />
                Log out
              </button>
            </div>
          </Transition>
        </div>
      </template>
      <template v-else>
        <NuxtLink
          to="/login"
          :class="$style.authBtn"
          aria-label="Log in"
          title="Log in"
        >
          <Icon name="ph:sign-in" aria-hidden="true" :class="$style.authIcon" />
          <span :class="$style.authLabel">Log in</span>
        </NuxtLink>
      </template>
    </div>
  </nav>
</template>

<style module lang="scss">
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 64px;
  background-color: color-mix(in srgb, var(--background-color) 97%, transparent);
  border-right: 1px solid
    color-mix(in srgb, var(--foreground-color) 10%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  z-index: 20;
  gap: 0.5rem;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #ffe44d;
  color: #1a1a1a;
  text-decoration: none;
  margin-bottom: 0.75rem;
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 2px;
  }
}

.brandIcon {
  font-size: 1.25rem;
}

.links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  flex: 1;
}

.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  padding-top: 0.5rem;
  border-top: 1px solid color-mix(in srgb, var(--foreground-color) 10%, transparent);
}

/* logged-in: avatar button + popup */
.menuWrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatarBtn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffe44d;
  color: #1a1a1a;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  line-height: 1;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.82;
  }

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 2px;
  }
}

.popup {
  position: absolute;
  bottom: calc(100% + 8px);
  left: calc(100% + 8px);
  min-width: 200px;
  background-color: var(--background-color);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 14%, transparent);
  border-radius: 12px;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--foreground-color) 12%, transparent);
  padding: 0.375rem;
  z-index: 100;
  overflow: hidden;
}

.popupEmail {
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--foreground-color) 50%, transparent);
  padding: 0.375rem 0.625rem 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 190px;
}

.popupDivider {
  height: 1px;
  background-color: color-mix(in srgb, var(--foreground-color) 10%, transparent);
  margin: 0.25rem 0;
}

.popupItem {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground-color);
  text-decoration: none;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background-color 0.12s;

  &:hover {
    background-color: color-mix(in srgb, var(--foreground-color) 7%, transparent);
  }

  &:focus-visible {
    outline: 2px solid #ffe44d;
    outline-offset: -2px;
  }
}

.popupItemDanger {
  color: #d93025;

  &:hover {
    background-color: color-mix(in srgb, #d93025 8%, transparent);
  }
}

/* logged-out: log in link */
.authBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  width: 52px;
  padding: 0.5rem 0.25rem;
  border-radius: 8px;
  text-decoration: none;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--foreground-color) 7%, transparent);
    color: var(--foreground-color);
  }

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 2px;
    color: var(--foreground-color);
  }
}

.authIcon {
  font-size: 1.25rem;
}

.authLabel {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1;
}
</style>

<style>
/* Popup transition — global so Vue's Transition can see it */
.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .popup-enter-active,
  .popup-leave-active {
    transition: none;
  }
}
</style>
