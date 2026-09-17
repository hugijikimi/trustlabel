"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LangToggle from "@/components/LangToggle";
import SignOutButton from "@/components/SignOutButton";
import { publish, remove, unpublish } from "@/lib/disclosures";
import { supabase } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";

function StatusPill({ published, t }) {
  return (
    <span
      className={
        published
          ? "rounded-full bg-seal-tint px-2.5 py-1 text-[12px] font-medium text-seal"
          : "rounded-full border border-rule bg-paper px-2.5 py-1 text-[12px] font-medium text-ink-muted"
      }
    >
      {published ? t("status_live") : t("status_draft")}
    </span>
  );
}

function DisclosureCard({ row, origin, t }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [checkOpen, setCheckOpen] = useState(false);
  const [checkUrl, setCheckUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [check, setCheck] = useState(null);

  const url = `${origin}/d/${row.slug}`;

  async function run(action) {
    setBusy(true);
    setError("");
    const { error: actionError } = await action();
    if (actionError) {
      setBusy(false);
      setError(actionError.message ?? String(actionError));
      return;
    }
    // The list is server-rendered, so ask the server for it again rather than
    // patching a local copy that could drift from the row that actually saved.
    router.refresh();
    setBusy(false);
    setConfirming(false);
  }

  async function handleCheck(event) {
    event.preventDefault();
    setChecking(true);
    setCheck(null);
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ disclosureId: row.id, url: checkUrl.trim() }),
      });
      setCheck(await response.json());
    } catch {
      setCheck({ outcome: "unchecked", reason: "network" });
    }
    setChecking(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the URL is on screen to copy by hand */
    }
  }

  return (
    <div className="flex flex-col rounded-card border border-rule bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-[17px] leading-snug font-semibold text-ink">
          {row.shop_name?.trim() || t("preview_shop_placeholder")}
        </h2>
        <StatusPill published={row.published} t={t} />
      </div>

      <p className="mt-1 text-[12px] text-ink-muted">
        {t("card_updated", { date: row.updated_at?.slice(0, 10) ?? "" })}
      </p>

      <p className="mt-4 text-[12px] text-ink-muted">{t("final_url_label")}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <code className="rounded-lg bg-paper px-3 py-2 text-[13px] break-all text-ink">{url}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border-[1.5px] border-rule-strong bg-card px-4 py-2 text-[13px] text-ink"
        >
          {copied ? t("final_copied") : t("final_copy")}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-[13px] leading-relaxed text-brick">
          {t("card_error")} {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-rule pt-4">
        <Link
          href={`/wizard?id=${row.id}`}
          className="rounded-lg border-[1.5px] border-rule-strong bg-card px-4 py-2 text-[13px] text-ink"
        >
          {t("card_edit")}
        </Link>

        <button
          type="button"
          disabled={busy}
          onClick={() =>
            run(() =>
              row.published ? unpublish(supabase, row.id) : publish(supabase, row.id)
            )
          }
          className="rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-paper hover:opacity-90 disabled:opacity-40"
        >
          {busy ? t("card_working") : row.published ? t("card_unpublish") : t("card_publish")}
        </button>

        <button
          type="button"
          onClick={() => setCheckOpen((open) => !open)}
          className="rounded-lg border-[1.5px] border-rule-strong bg-card px-4 py-2 text-[13px] text-ink"
        >
          {t("card_check")}
        </button>

        {confirming ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-ink-muted">{t("card_delete_ask")}</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => remove(supabase, row.id))}
              className="rounded-lg bg-brick px-4 py-2 text-[13px] font-medium text-white disabled:opacity-40"
            >
              {t("card_delete_yes")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(false)}
              className="rounded-lg border-[1.5px] border-rule-strong bg-card px-4 py-2 text-[13px] text-ink"
            >
              {t("card_delete_no")}
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirming(true)}
            className="rounded-lg border-[1.5px] border-rule-strong bg-card px-4 py-2 text-[13px] text-ink disabled:opacity-40"
          >
            {t("card_delete")}
          </button>
        )}
      </div>

      {checkOpen ? (
        <form onSubmit={handleCheck} className="mt-4 border-t border-rule pt-4">
          <p className="text-[13px] font-medium text-ink">{t("check_title")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="url"
              value={checkUrl}
              onChange={(event) => setCheckUrl(event.target.value)}
              placeholder={t("check_url_placeholder")}
              disabled={checking}
              className="min-w-0 flex-1 rounded-lg border border-rule bg-paper px-3 py-2 text-base text-ink outline-none focus:border-ink disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={checking || !checkUrl.trim()}
              className="rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-paper disabled:opacity-40"
            >
              {checking ? t("check_running") : t("check_run")}
            </button>
          </div>

          {check ? <CheckResult result={check} t={t} /> : null}
        </form>
      ) : null}
    </div>
  );
}

/**
 * Three outcomes, never two. "We could not reach your page" is not "your
 * disclosure is missing", and one of those is an accusation.
 */
function CheckResult({ result, t }) {
  if (result.outcome === "found") {
    return (
      <p className="mt-3 rounded-lg bg-seal-tint px-3 py-2 text-[13px] leading-relaxed text-seal">
        {t("check_found")}
      </p>
    );
  }

  if (result.outcome === "not_found") {
    return (
      <p className="mt-3 rounded-lg bg-amber-tint px-3 py-2 text-[13px] leading-relaxed text-amber">
        {t("check_not_found")}
      </p>
    );
  }

  const reason = result.reason ? t(`check_reason_${result.reason}`, { status: result.httpStatus }) : "";
  return (
    <p className="mt-3 rounded-lg border border-rule bg-paper px-3 py-2 text-[13px] leading-relaxed text-ink-muted">
      {t("check_unchecked")} {reason}
    </p>
  );
}

function EmptyState({ t }) {
  return (
    <div className="flex flex-col items-start rounded-card border-2 border-dashed border-rule-strong p-8 sm:col-span-2">
      <p className="text-[15px] text-ink-muted">{t("dash_empty_line")}</p>
      <Link
        href="/wizard"
        className="mt-5 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90"
      >
        {t("dash_empty_button")}
      </Link>
    </div>
  );
}

export default function Dashboard({ rows = [], email, origin, loadError }) {
  const { t } = useLang();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <span className="font-display text-[17px] font-semibold text-ink">{t("brand")}</span>
        <div className="flex items-center gap-3">
          <LangToggle />
          <SignOutButton />
        </div>
      </header>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] leading-tight font-semibold text-ink">
            {t("dash_title")}
          </h1>
          <p className="mt-2 text-[13px] text-ink-muted">{t("dash_signed_in", { email })}</p>
        </div>
        <Link
          href="/wizard"
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90"
        >
          {t("dash_new")}
        </Link>
      </div>

      {loadError ? (
        <p role="alert" className="mb-6 text-[13px] leading-relaxed text-brick">
          {t("dash_load_error")} {loadError}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {rows.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          rows.map((row) => (
            <DisclosureCard key={row.id} row={row} origin={origin} t={t} />
          ))
        )}
      </div>
    </main>
  );
}
