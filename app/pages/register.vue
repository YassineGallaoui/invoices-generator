<script setup lang="ts">
definePageMeta({ layout: false });

const { loggedIn, fetch: fetchSession } = useUserSession();
if (loggedIn.value) await navigateTo("/");

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }

  loading.value = true;
  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: { email: email.value, password: password.value },
    });
    await fetchSession();
    await navigateTo("/");
  } catch (e: unknown) {
    error.value =
      (e as { data?: { message?: string } })?.data?.message ??
      "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.card">
      <div :class="$style.brand" aria-hidden="true">
        <Icon name="ph:receipt" />
      </div>
      <h1 :class="$style.title">Create account</h1>

      <form :class="$style.form" novalidate @submit.prevent="submit">
        <div :class="$style.field">
          <label for="email" :class="$style.label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :class="$style.input"
            placeholder="you@example.com"
          />
        </div>

        <div :class="$style.field">
          <label for="password" :class="$style.label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
            :class="$style.input"
            placeholder="At least 8 characters"
          />
        </div>

        <div :class="$style.field">
          <label for="confirm-password" :class="$style.label">Confirm password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            :class="$style.input"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" role="alert" :class="$style.error">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" :class="$style.submit">
          {{ loading ? "Creating account…" : "Create account" }}
        </button>
      </form>

      <p :class="$style.footer">
        Already have an account?
        <NuxtLink to="/login" :class="$style.link">Log in</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style module lang="scss">
.page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: var(--background-color);
}

.card {
  width: 100%;
  max-width: 380px;
  background-color: color-mix(in srgb, var(--foreground-color) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 10%, transparent);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: #ffe44d;
  color: #1a1a1a;
  font-size: 1.4rem;
  margin-bottom: 1.25rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.75rem;
  letter-spacing: -0.02em;
  color: var(--foreground-color);
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--foreground-color) 80%, transparent);
  letter-spacing: 0.01em;
}

.input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  background-color: color-mix(in srgb, var(--foreground-color) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  border-radius: 8px;
  color: var(--foreground-color);
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: color-mix(in srgb, var(--foreground-color) 30%, transparent);
  }

  &:focus {
    outline: none;
    border-color: #ffe44d;
    box-shadow: 0 0 0 3px color-mix(in srgb, #ffe44d 30%, transparent);
  }
}

.error {
  font-size: 0.8125rem;
  color: #d93025;
  background-color: color-mix(in srgb, #d93025 10%, transparent);
  border: 1px solid color-mix(in srgb, #d93025 25%, transparent);
  border-radius: 8px;
  padding: 0.625rem 0.875rem;
  line-height: 1.45;
}

.submit {
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.6875rem 1rem;
  font-size: 0.9375rem;
  font-weight: 700;
  background-color: #ffe44d;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  letter-spacing: 0.01em;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.footer {
  margin-top: 1.5rem;
  font-size: 0.8125rem;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
}

.link {
  color: var(--foreground-color);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:focus-visible {
    outline: 2px solid #ffe44d;
    outline-offset: 2px;
    border-radius: 2px;
  }
}
</style>
