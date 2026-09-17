"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN = 60;

export default function LoginForm({ linkFailed = false }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(linkFailed ? "error" : "idle"); // idle | sending | sent | error
  // A key rather than a sentence, so the message follows the language toggle.
  const [errorKey, setErrorKey] = useState(linkFailed ? "login_link_failed" : null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleSubmit(event) {
    event.preventDefault();
    const address = email.trim();

    if (!EMAIL_RE.test(address)) {
      setStatus("error");
      setErrorKey("login_invalid");
      return;
    }

    setStatus("sending");
    setErrorKey(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus("error");
      setErrorKey(error.status === 429 ? "login_rate" : "login_error");
      return;
    }

    setStatus("sent");
    setCooldown(RESEND_COOLDOWN);
  }

  if (status === "sent") {
    return (
      <>
        <h1 className="font-display text-[28px] leading-tight font-semibold text-ink keep-all">
          {t("login_sent_title")}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted keep-all">
          {t("login_sent_body", { email: email.trim() })}
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setErrorKey(null);
          }}
          disabled={cooldown > 0}
          className="mt-8 min-h-[48px] w-full rounded-lg border-[1.5px] border-rule-strong bg-card px-5 text-sm text-ink disabled:opacity-50"
        >
          {cooldown > 0 ? t("login_resend_in", { n: cooldown }) : t("login_resend")}
        </button>
        <p className="mt-3 text-[12px] leading-relaxed text-ink-muted keep-all">
          {t("login_spam")}
        </p>
      </>
    );
  }

  const sending = status === "sending";

  return (
    <>
      <h1 className="font-display text-[28px] leading-tight font-semibold text-ink keep-all">
        {t("login_title")}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted keep-all">{t("login_sub")}</p>

      <form onSubmit={handleSubmit} className="mt-8" noValidate>
        <label htmlFor="email" className="block text-[15px] font-medium text-ink">
          {t("login_email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={sending}
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "login-error" : undefined}
          placeholder={t("login_email_placeholder")}
          className="mt-2 w-full rounded-lg border border-rule bg-card px-4 py-3 text-base text-ink outline-none focus:border-ink disabled:opacity-60"
        />

        {status === "error" && errorKey ? (
          <p
            id="login-error"
            role="alert"
            className="mt-3 text-[13px] leading-relaxed text-brick keep-all"
          >
            {t(errorKey)}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={sending}
          className="mt-6 min-h-[48px] w-full rounded-lg bg-ink px-5 text-[15px] font-medium text-paper hover:opacity-90 disabled:opacity-50"
        >
          {sending ? t("login_sending") : t("login_send")}
        </button>
      </form>
    </>
  );
}
