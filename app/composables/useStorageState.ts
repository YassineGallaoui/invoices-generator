/**
 * SSR-safe reactive localStorage wrapper.
 * Returns a ref hydrated from storage after mount; writes back on every change.
 */
export function useStorageState<T>(key: string, defaultValue: T) {
  const state = ref<T>(structuredClone(defaultValue));

  onMounted(() => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        state.value = JSON.parse(raw) as T;
      } catch {
        // Corrupt entry — start fresh
      }
    }
  });

  watch(
    state,
    (val) => {
      localStorage.setItem(key, JSON.stringify(val));
    },
    { deep: true },
  );

  return state;
}
