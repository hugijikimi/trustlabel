"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNIQUE_VIOLATION = "23505";

const PLATFORMS = ["cafe24", "naver", "imweb", "other"];

export default function WaitlistForm() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | already | error
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const address = email.trim();

    if (!EMAIL_RE.test(address)) {
      setStatus("error");
      setMessage(t("waitlist_invalid"));
      return;
    }

    setStatus("sending");
    setMessage("");

    // No .select() on purpose: the anon policy grants INSERT and nothing else,
    // so asking for the row back would fail on a missing SELECT policy. That
    // policy is missing deliberately — a readable waitlist is a public dump of
    // everyone's email address.
    const { error } = await supabase.from("waitlist").insert({
      email: address,
      shop_name: shopName.trim() || null,
      platform: platform || null,
    });

    if (error) {
      // Already signed up is a success from where the visitor is standing.
      if (error.code === UNIQUE_VIOLATION) {
        setStatus("already");
        return;
      }
      setStatus("error");
      setMessage(t("waitlist_error"));
      return;
    }

    setStatus("done");
  }

  // Replaced, not a toast: something that vanishes leaves people unsure whether
  // it worked, and they submit again.
  if (status === "done" || status === "already") {
    return (
      <div className="rounded-card border border-rule bg-card p-8">
        <p className="font-display text-[20px] leading-snug font-semibold text-ink">
          {status === "already" ? t("waitlist_already_title") : t("waitlist_done_title")}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          {t("waitlist_done_body", { email: email.trim() })}
        </p>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-card border border-rule bg-card p-6 sm:p-8">
      <label htmlFor="wl-email" className="block text-[15px] font-medium text-ink">
        {t("waitlist_email")}
      </label>
      <input
        id="wl-email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={sending}
        aria-invalid={status === "error"}
        aria-describedby={status === "error" ? "wl-error" : undefined}
        placeholder={t("waitlist_email_placeholder")}
        className="mt-2 w-full rounded-lg border border-rule bg-paper px-4 py-3 text-base text-ink outline-none focus:border-ink disabled:opacity-60"
      />

      <label htmlFor="wl-shop" className="mt-5 block text-[15px] font-medium text-ink">
        {t("waitlist_shop_optional")}
      </label>
      <input
        id="wl-shop"
        name="shop_name"
        type="text"
        autoComplete="organization"
        value={shopName}
        onChange={(event) => setShopName(event.target.value)}
        disabled={sending}
        placeholder={t("waitlist_shop_placeholder")}
        className="mt-2 w-full rounded-lg border border-rule bg-paper px-4 py-3 text-base text-ink outline-none focus:border-ink disabled:opacity-60"
      />

      <label htmlFor="wl-platform" className="mt-5 block text-[15px] font-medium text-ink">
        {t("waitlist_platform")}
      </label>
      <select
        id="wl-platform"
        name="platform"
        value={platform}
        onChange={(event) => setPlatform(event.target.value)}
        disabled={sending}
        className="mt-2 w-full rounded-lg border border-rule bg-paper px-4 py-3 text-base text-ink outline-none focus:border-ink disabled:opacity-60"
      >
        <option value="">{t("waitlist_platform_none")}</option>
        {PLATFORMS.map((value) => (
          <option key={value} value={value}>
            {t(`waitlist_platform_${value}`)}
          </option>
        ))}
      </select>

      {status === "error" ? (
        <p id="wl-error" role="alert" className="mt-4 text-[13px] leading-relaxed text-brick">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 min-h-[48px] w-full rounded-lg bg-ink px-5 text-[15px] font-medium text-paper hover:opacity-90 disabled:opacity-50"
      >
        {sending ? t("waitlist_submitting") : t("waitlist_submit")}
      </button>
    </form>
  );
}
