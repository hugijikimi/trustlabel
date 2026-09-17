import { getById } from "@/lib/disclosures";
import { HEADING } from "@/lib/generate";
import { parseTarget, resolvesPublicly } from "@/lib/safe-url";
import { createClient } from "@/lib/supabase/server";

const TIMEOUT_MS = 10_000;
const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = "TrustLabelInstallChecker/1.0 (+https://trustlabel.store)";

function json(body, status = 200) {
  return Response.json(body, { status });
}

/** Reads at most MAX_BYTES, then hangs up. A storefront is not a download. */
async function readCapped(response) {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  try {
    await reader.cancel();
  } catch {
    /* already closed */
  }

  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer.subarray(0, MAX_BYTES));
}

/**
 * Follows redirects by hand, re-screening every hop. `redirect: "follow"` would
 * happily walk a public URL to 127.0.0.1 on the second hop, which is the whole
 * thing the guard exists to stop.
 */
async function fetchGuarded(start) {
  let url = start;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const resolved = await resolvesPublicly(url.hostname);
    if (resolved.error) return { reason: resolved.error };

    let response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
      });
    } catch (error) {
      return { reason: error?.name === "TimeoutError" ? "timeout" : "network" };
    }

    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      let next;
      try {
        next = parseTarget(new URL(location, url).toString());
      } catch {
        return { reason: "invalid" };
      }
      if (next.error) return { reason: next.error };
      url = next.url;
      continue;
    }

    return { response, url };
  }

  return { reason: "redirects" };
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getUser();
  if (!session?.user) return json({ error: "unauthorized" }, 401);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const { disclosureId, url: raw } = payload ?? {};

  // RLS scopes this to the caller's own rows, so this is the ownership check
  // as well as the lookup.
  const { data: disclosure } = await getById(supabase, disclosureId);
  if (!disclosure) return json({ error: "not_found" }, 404);

  const target = parseTarget(raw);
  if (target.error) {
    // Refusing is a result worth recording — it is how you find out someone
    // has been pasting an intranet address at a public checker.
    await supabase.from("install_checks").insert({
      disclosure_id: disclosure.id,
      url: String(raw ?? "").slice(0, 2000),
      found: null,
      http_status: null,
      error: target.error,
    });
    return json({ outcome: "unchecked", reason: target.error });
  }

  const attempt = await fetchGuarded(target.url);

  if (attempt.reason) {
    await supabase.from("install_checks").insert({
      disclosure_id: disclosure.id,
      url: target.url.toString(),
      found: null,
      http_status: null,
      error: attempt.reason,
    });
    return json({ outcome: "unchecked", reason: attempt.reason });
  }

  const { response } = attempt;

  // A page we could not load is not a page missing its disclosure. Never let a
  // 500 or a 404 read as an accusation.
  if (!response.ok) {
    await supabase.from("install_checks").insert({
      disclosure_id: disclosure.id,
      url: target.url.toString(),
      found: null,
      http_status: response.status,
      error: "status",
    });
    return json({ outcome: "unchecked", reason: "status", httpStatus: response.status });
  }

  const body = await readCapped(response);
  const found = body.includes(HEADING) || body.includes(`/api/embed/${disclosure.slug}`);

  await supabase.from("install_checks").insert({
    disclosure_id: disclosure.id,
    url: target.url.toString(),
    found,
    http_status: response.status,
    error: null,
  });

  return json({
    outcome: found ? "found" : "not_found",
    httpStatus: response.status,
    url: target.url.toString(),
  });
}
