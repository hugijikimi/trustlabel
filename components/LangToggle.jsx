"use client";

import { LANGS } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

export default function LangToggle() {
  const { lang, t, setLang } = useLang();

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
