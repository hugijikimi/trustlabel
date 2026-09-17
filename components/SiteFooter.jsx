"use client";

import { useLang } from "@/lib/useLang";

/** The not-legal-advice line. It ships, on every page that has chrome. */
export default function SiteFooter({ width = "max-w-5xl" }) {
  const { t } = useLang();

  return (
    <footer className="mt-auto border-t border-rule">
      <div className={`mx-auto w-full ${width} px-6 py-8`}>
        <p className="text-[12px] leading-relaxed text-ink-muted">{t("disclaimer")}</p>
      </div>
    </footer>
  );
}
