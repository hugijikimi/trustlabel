"use client";

import Link from "next/link";
import Label from "@/components/Label";
import LangToggle from "@/components/LangToggle";
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

function Screen({ file, caption, present, t }) {
  return (
    <figure className="m-0">
      {present ? (
        // eslint-disable-next-line @next/next/no-img-element -- a static screenshot, already sized
        <img
          src={`/shots/${file}`}
          alt={t(caption)}
          className="w-full rounded-card border border-rule bg-card"
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-card border-2 border-dashed border-rule-strong px-4 text-center">
          <span className="text-[12px] text-ink-faint">{t("screen_missing")}</span>
        </div>
      )}
      <figcaption className="mt-3 text-[13px] text-ink-muted">{t(caption)}</figcaption>
    </figure>
  );
}

export default function Landing({ daysLeft, shots = {} }) {
  const { t } = useLang();

  return (
    <div className="w-full">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-display text-[17px] font-semibold text-ink">{t("brand")}</span>
        <div className="flex items-center gap-3">
          <LangToggle />
          <Link
            href="/login"
            className="rounded-lg border-[1.5px] border-rule-strong bg-card px-4 py-2 text-[13px] text-ink"
          >
            {t("nav_signin")}
          </Link>
        </div>
      </header>

      {/* 1 · Hero — the deadline is present in the first ten seconds. */}
      <section className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-12 lg:grid-cols-[1fr_1fr] lg:py-20">
        <div>
          <p className="text-[12px] font-medium tracking-wide text-amber uppercase">
            {daysLeft > 0 ? t("landing_countdown", { days: daysLeft }) : t("landing_countdown_past")}
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.15] font-semibold text-ink sm:text-[44px]">
            {t("landing_headline")}
          </h1>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-muted">
            {t("landing_sub")}
          </p>
          <a
            href="#waitlist"
            className="mt-8 inline-flex min-h-[48px] items-center rounded-lg bg-ink px-6 text-[15px] font-medium text-paper hover:opacity-90"
          >
            {t("landing_cta")}
          </a>
        </div>

        <div className="lg:rotate-1">
          <div className="shadow-[0_18px_50px_rgba(22,25,29,0.10)]">
            <Label lines={EXAMPLE_LINES} shopName={EXAMPLE_SHOP} />
          </div>
        </div>
      </section>

      {/* 2 · Problem — the fine stated once, in text, with no alarm box. */}
      <section className="border-t border-rule">
        <div className="mx-auto w-full max-w-2xl px-6 py-16">
          <h2 className="font-display text-[28px] leading-tight font-semibold text-ink">
            {t("problem_title")}
          </h2>
          <p className="mt-5 text-[15px] leading-[1.8] text-ink-muted">{t("problem_body")}</p>
        </div>
      </section>

      {/* 3 · Solution */}
      <section className="border-t border-rule">
        <div className="mx-auto w-full max-w-2xl px-6 py-16">
          <h2 className="font-display text-[28px] leading-tight font-semibold text-ink">
            {t("solution_title")}
          </h2>
          <p className="mt-5 text-[15px] leading-[1.8] text-ink-muted">{t("solution_body")}</p>
        </div>
      </section>

      {/* 4 · Three screens */}
      <section className="border-t border-rule">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-[28px] leading-tight font-semibold text-ink">
            {t("screens_title")}
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {SCREENS.map((screen) => (
              <Screen
                key={screen.key}
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
        <div className="mx-auto w-full max-w-lg px-6 py-16">
          <h2 className="font-display text-[28px] leading-tight font-semibold text-ink">
            {t("waitlist_title")}
          </h2>
          <p className="mt-3 mb-8 text-[15px] leading-relaxed text-ink-muted">
            {t("waitlist_body")}
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* 6 · Footer */}
      <footer className="border-t border-rule">
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
          <p className="text-[12px] leading-relaxed text-ink-muted">{t("disclaimer")}</p>
          <p className="mt-3 text-[12px] text-ink-faint">{t("brand")}</p>
        </div>
      </footer>
    </div>
  );
}
