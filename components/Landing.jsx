"use client";

import Link from "next/link";
import Label from "@/components/Label";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import WaitlistForm from "@/components/WaitlistForm";
import { generateLines } from "@/lib/generate";
import { useLang } from "@/lib/useLang";

// A fictional shop, so the example on a live public page is obviously a demo.
const EXAMPLE_SHOP = "해피몰";
const EXAMPLE_LINES = generateLines({
  reviewer_scope: "verified",
  posting_period: "permanent",
  uses_ai_ranking: true,
  ai_criteria: ["detail", "photo"],
  deletion_criteria: "policy",
}).map((text) => ({ text, dim: false }));

const SCREENS = [
  { key: "wizard", file: "wizard.png", caption: "screen_wizard" },
  { key: "public", file: "public-page.png", caption: "screen_public" },
  { key: "embed", file: "embed.png", caption: "screen_embed" },
];

function Screen({ index, file, caption, present, t }) {
  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-card border border-rule bg-card shadow-[0_1px_2px_rgba(22,25,29,0.05),0_12px_28px_rgba(22,25,29,0.07)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        {/* A window sill, so a screenshot reads as a screen rather than a picture. */}
        <div className="flex items-center gap-1.5 border-b border-rule px-3 py-2.5">
          <span className="h-2 w-2 rounded-full bg-rule-strong" />
          <span className="h-2 w-2 rounded-full bg-rule-strong" />
          <span className="h-2 w-2 rounded-full bg-rule-strong" />
        </div>
        {present ? (
          // eslint-disable-next-line @next/next/no-img-element -- a static screenshot, already sized
          <img src={`/shots/${file}`} alt={t(caption)} className="block w-full" />
        ) : (
          <div className="flex aspect-[1280/860] w-full items-center justify-center px-4 text-center">
            <span className="text-[12px] text-ink-faint">{t("screen_missing")}</span>
          </div>
        )}
      </div>

      <figcaption className="mt-4 flex items-baseline gap-3">
        <span className="font-display text-[13px] font-semibold text-seal tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[15px] leading-snug text-ink">{t(caption)}</span>
      </figcaption>
    </figure>
  );
}

export default function Landing({ daysLeft, shots = {} }) {
  const { t } = useLang();

  return (
    <div className="w-full">
      <SiteHeader>
        <Link
          href="/login"
          className="rounded-lg border-[1.5px] border-rule-strong bg-card px-4 py-2 text-[13px] text-ink"
        >
          {t("nav_signin")}
        </Link>
      </SiteHeader>

      {/* 1 · Hero — the deadline is on screen in the first second. */}
      <section className="relative overflow-hidden">
        {/* The Label is lit rather than pasted on. Sits behind everything and
            takes no clicks. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 blur-[90px]"
          style={{
            background:
              "radial-gradient(38rem 26rem at 72% 42%, var(--color-seal-tint), transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-tint px-3 py-1.5 text-[12px] font-medium text-amber">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
              {daysLeft > 0
                ? t("landing_countdown", { days: daysLeft })
                : t("landing_countdown_past")}
            </p>

            <h1 className="mt-5 font-display text-[38px] leading-[1.12] font-semibold text-ink keep-all sm:text-[46px]">
              {t("landing_headline")}
            </h1>

            <p className="mt-6 max-w-[44ch] text-[16px] leading-[1.75] text-ink-muted keep-all">
              {t("landing_sub")}
            </p>

            <a
              href="#waitlist"
              className="mt-9 inline-flex min-h-[52px] items-center rounded-xl bg-ink px-7 text-[15px] font-medium text-paper shadow-[0_8px_20px_rgba(22,25,29,0.18)] transition-transform hover:-translate-y-px hover:opacity-95 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {t("landing_cta")}
            </a>
          </div>

          <div className="lg:rotate-[1.2deg]">
            <Label lines={EXAMPLE_LINES} shopName={EXAMPLE_SHOP} />
          </div>
        </div>
      </section>

      {/* 2 · Problem — the fine stated once, in text, with no alarm box. */}
      <section className="border-t border-rule bg-card">
        <div className="mx-auto w-full max-w-2xl px-6 py-20">
          <h2 className="font-display text-[30px] leading-tight font-semibold text-ink keep-all">
            {t("problem_title")}
          </h2>
          <p className="mt-6 text-[16px] leading-[1.85] text-ink-muted keep-all">
            {t("problem_body")}
          </p>
        </div>
      </section>

      {/* 3 · Solution */}
      <section>
        <div className="mx-auto w-full max-w-2xl px-6 py-20">
          <h2 className="font-display text-[30px] leading-tight font-semibold text-ink keep-all">
            {t("solution_title")}
          </h2>
          <p className="mt-6 text-[16px] leading-[1.85] text-ink-muted keep-all">
            {t("solution_body")}
          </p>
        </div>
      </section>

      {/* 4 · Three screens */}
      <section className="border-t border-rule bg-card">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <h2 className="font-display text-[30px] leading-tight font-semibold text-ink keep-all">
            {t("screens_title")}
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {SCREENS.map((screen, index) => (
              <Screen
                key={screen.key}
                index={index}
                file={screen.file}
                caption={screen.caption}
                present={Boolean(shots[screen.file])}
                t={t}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Waitlist */}
      <section id="waitlist" className="border-t border-rule">
        <div className="mx-auto w-full max-w-lg px-6 py-20">
          <h2 className="font-display text-[30px] leading-tight font-semibold text-ink keep-all">
            {t("waitlist_title")}
          </h2>
          <p className="mt-4 mb-8 text-[16px] leading-relaxed text-ink-muted keep-all">
            {t("waitlist_body")}
          </p>
          <WaitlistForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
