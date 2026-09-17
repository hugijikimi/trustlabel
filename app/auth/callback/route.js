import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Two ways in, on purpose.
 *
 * `token_hash` is the flow that works from any browser: the link carries
 * everything needed to verify it, so a seller who requests the link on a laptop
 * and opens it in their phone's mail app still lands signed in. It needs the
 * Supabase email template to send `?token_hash={{ .TokenHash }}&type=email`.
 *
 * `code` is PKCE, which is what @supabase/ssr's browser client requests and
 * what the default `{{ .ConfirmationURL }}` template produces. It only works in
 * the browser that asked for the link, because the verifier is in that
 * browser's cookies.
 *
 * Supporting both means the template can be switched without a flag day, and
 * old links already in inboxes keep working.
 */

const EMAIL_OTP_TYPES = new Set([
  "email",
  "magiclink",
  "signup",
  "invite",
  "recovery",
  "email_change",
]);

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  if (tokenHash && EMAIL_OTP_TYPES.has(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
