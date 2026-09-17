"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_LANG, LANGS, translate } from "@/lib/i18n";

export const LANG_STORAGE_KEY = "trustlabel-lang";
const LANG_EVENT = "trustlabel:langchange";

function readLang() {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return LANGS.includes(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function subscribe(onStoreChange) {
  window.addEventListener(LANG_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(LANG_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function setLang(next) {
  if (!LANGS.includes(next)) return;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  } catch {
    /* private mode, blocked storage — the toggle still works for this page */
  }
  document.documentElement.lang = next;
  window.dispatchEvent(new Event(LANG_EVENT));
}

/**
 * Reads the language from localStorage without a setState-in-effect: the server
 * snapshot is the default, and React swaps in the stored value after hydration.
 */
export function useLang() {
  const lang = useSyncExternalStore(subscribe, readLang, () => DEFAULT_LANG);
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  return { lang, t, setLang };
}
