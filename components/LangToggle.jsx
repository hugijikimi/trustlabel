"use client";

import { useEffect } from "react";
import { LANGS } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

export default function LangToggle() {
  const { lang, t, setLang } = useLang();

  // Keep <html lang> honest. The server renders the default, so a visitor
  // who chose the other language needs it corrected after hydration — this
  // is a screen reader's cue for which language to pronounce.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div
      role="group"
      aria-label={t("lang_toggle_label")}
      className="inline-flex overflow-hidden rounded-lg border border-rule bg-card"
    >
      {LANGS.map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
              active ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
            }`}
          >
            {t(`lang_${code}`)}
          </button>
        );
      })}
    </div>
  );
}
