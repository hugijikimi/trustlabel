"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN = 60;

function describe(error) {
  if (error.status === 429) {
    return "Too many sign-in emails too quickly. The built-in mailer only allows a couple per hour — wait a minute, then try again.";
  }
  return error.message || "We couldn't send the link. Check the address and try again.";
}

export default function LoginForm({ initialError = "" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(initialError ? "error" : "idle"); // idle | sending | sent | error
  const [message, setMessage] = useState(initialError);
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
      setMessage(
        "That doesn't look like an email address — check for a missing @ or a typo in the domain."
      );
      return;
    }

    setStatus("sending");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus("error");
      setMessage(describe(error));
      return;
    }

    setStatus("sent");
    setCooldown(RESEND_COOLDOWN);
  }

  if (status === "sent") {
    return (
      <>
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          We sent a sign-in link to{" "}
          <span className="font-medium text-neutral-900 dark:text-neutral-100">{email.trim()}</span>.
          Open it in this browser — the link will not work anywhere else.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
          disabled={cooldown > 0}
          className="mt-8 w-full rounded-lg border-[1.5px] border-neutral-300 px-5 py-3 text-sm disabled:opacity-50 dark:border-neutral-700"
        >
          {cooldown > 0 ? `Send another link in ${cooldown}s` : "Send another link"}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">
          Nothing after a minute? Check spam before sending again — the mailer allows only a couple of sends per hour.
        </p>
      </>
    );
  }

  const sending = status === "sending";

  return (
    <>
      <h1 className="text-2xl font-semibold">Sign in to TrustLabel</h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Enter your email and we&apos;ll send you a sign-in link. No password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8" noValidate>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={sending}
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "login-error" : undefined}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base outline-none focus:border-neutral-900 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
        />

        {status === "error" ? (
          <p id="login-error" role="alert" className="mt-3 text-sm leading-relaxed text-red-700 dark:text-red-400">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={sending}
          className="mt-6 w-full rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {sending ? "Sending…" : "Send me a link"}
        </button>
      </form>
    </>
  );
}
