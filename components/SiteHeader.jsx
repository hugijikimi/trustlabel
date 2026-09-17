"use client";

import Link from "next/link";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/lib/useLang";

/**
 * Shared chrome for the signed-in app and the landing page.
 *
 * Deliberately not in app/layout.jsx: the root layout also wraps /d/[slug],
 * and DESIGN.md §4 wants the public page to carry nothing but the Label, the
 * QR and the disclaimer — no nav, no toggle.
 */
export default function SiteHeader({ width = "max-w-5xl", children }) {
  const { t } = useLang();

  return (
    <header className={`mx-auto flex w-full ${width} items-center justify-between px-6 py-6`}>
      <Link href="/" className="font-display text-[17px] font-semibold text-ink">
        {t("brand")}
      </Link>
      <div className="flex items-center gap-3">
        <LangToggle />
        {children}
      </div>
    </header>
  );
}
