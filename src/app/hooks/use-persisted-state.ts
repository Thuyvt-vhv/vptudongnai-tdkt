import { useState, useEffect } from "react";

/**
 * useState but synced to localStorage. Simulates shared backend state across
 * different logged-in users within the same browser.
 *
 * Uses a data-version key: bump STORE_VERSION when the data shape changes to
 * automatically discard stale cached data and reset to the initial value.
 */
const STORE_VERSION = "2026-04-29";

export function usePersistedState<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const dataKey    = `vq::${key}`;
  const versionKey = `vq::${key}::v`;

  const [state, setState] = useState<T>(() => {
    try {
      if (localStorage.getItem(versionKey) !== STORE_VERSION) return initial;
      const raw = localStorage.getItem(dataKey);
      return raw != null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(dataKey, JSON.stringify(state));
      localStorage.setItem(versionKey, STORE_VERSION);
    } catch { /* quota exceeded or private browsing — fail silently */ }
  }, [dataKey, versionKey, state]);

  return [state, setState];
}

/** Clear all persisted app data and reload — useful for resetting demo state */
export function clearPersistedData() {
  Object.keys(localStorage)
    .filter(k => k.startsWith("vq::"))
    .forEach(k => localStorage.removeItem(k));
}
