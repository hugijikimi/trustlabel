# Setup — Supabase + Vercel, from nothing

Do steps 1–3 **tonight**, not tomorrow. They involve waiting on other people's
servers, and doing them under time pressure in front of a room is how a workshop
day gets eaten.

---

## Verified 2026-09-17 — everything on this page is done

Checked from a terminal, not from a dashboard. What actually answered:

| Check | Result |
|---|---|
| `dig +short trustlabel.store` | `216.198.79.1` — Vercel ✅ |
| `https://trustlabel.store` | **200** — apex serves directly, no redirect hop ✅ |
| `https://www.trustlabel.store` | **308 → apex** — one canonical host, one cookie jar ✅ |
| Edge region | `icn1` (Seoul) ✅ |
| `disclosures`, `install_checks`, `waitlist` | all present, RLS enabled ✅ |
| `anon` insert into `disclosures` | refused, `42501` ✅ |
| `anon` select on `waitlist` | `[]` — the emails are not readable ✅ |
| `anon` select on a published disclosure | returns the row — no service key needed ✅ |
| Magic link | sent, arrived, opened, landed on `/dashboard` ✅ |
| `/`, `/login`, `/d/<slug>`, `/api/embed/<slug>` in production | all 200 ✅ |

**The app itself is built and deployed.** All twelve briefs in
[SPEC.md](SPEC.md) are done: magic-link auth, the generator, the wizard with
its live preview, save/publish, the dashboard, the public page, QR and link
preview, the embed, the install checker, and the landing page with its
waitlist.

### Two things this page cannot check for you

**Supabase Site URL.** It should be `https://trustlabel.store`, with the
redirect list keeping `https://trustlabel.store/**`, `https://*.vercel.app/**`
and `http://localhost:3000/**`. Keep the Vercel wildcard even now that the
domain works — if DNS misbehaves on the day, that hostname is the fallback and
sign-in still has to work on it.

**Port 3000 locally.** The redirect allow-list names `localhost:3000`
specifically, so a dev server on another port gets its magic links rejected
with an error the UI does not explain. `.claude/launch.json` pins it with
`autoPort: false` so it fails loudly rather than quietly working somewhere
links cannot reach.

---

## 1. Create the app locally (5 min) Status: DONE

```bash
npx create-next-app@latest trustlabel --js --tailwind --app --eslint --src-dir=false --import-alias="@/*"
cd trustlabel
npm install @supabase/supabase-js @supabase/ssr qrcode
```

`qrcode` is the only extra dependency. Everything else — the OG image, the embed,
the checker — is built in.

```bash
git init && git add -A && git commit -m "Initial commit"
gh repo create trustlabel --private --source=. --push Status: DONE (but using browser and github, no gh)
```

**Install the Vercel React skill *in the trustlabel project*** — Status: DONE

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
```

Done — `.claude/skills/` in this project now carries `vercel-react-best-practices`
alongside `supabase` and `supabase-postgres-best-practices`.

`.agents/`, `.claude/` and `skills-lock.json` are all in `.gitignore` — the
skills are not vendored, so a lock file for them would be noise.

---

## 2. Supabase (15 min)

1. **https://supabase.com/dashboard** → **New project** Status: DONE
   - Region **Northeast Asia (Seoul)** — your audience and your laptop are both
     there, and latency is visible on a projector.
   - Save the database password somewhere. You will not be shown it again.

2. **SQL Editor → New query** → paste everything from [SPEC.md §2](SPEC.md) Status: DONE
   (both tables, all five policies) → **Run**. Expect `Success. No rows returned`.

3. **Authentication → Sign In / Providers** Status: DONE
   - **Email** enabled.
   - **Confirm email** ON, and leave "Secure email change" alone.
   - You are using magic links, so no password settings matter.

4. **Authentication → URL Configuration** — this is where people lose an hour: Status: DONE

   | Field | Value |
   |---|---|
   | Site URL | `http://localhost:3000` for now |
   | Redirect URLs | `http://localhost:3000/**`, `https://*.vercel.app/**`, `https://trustlabel.store/**` |

   The wildcards matter: Vercel gives every deployment its own hostname, and a
   magic link that redirects to an unlisted URL fails with an error the UI does
   not explain. Add all three now and come back in step 3 to change Site URL.

   **Keep the `*.vercel.app` entry even after the domain works.** If DNS misbehaves
   on the day, the Vercel URL is your fallback and sign-in still has to work on it.

5. **Project Settings → API** — copy:  Status: DONE
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   You do **not** need the `service_role` key. The RLS policies in §2 are written
   so the public page and the embed work with the anon key alone. Do not put the
   service key in this project — a secret you never had cannot leak on stage.

6. `.env.local`: Status: DONE

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Add `.env.local` to `.gitignore` (create-next-app already does).

---

## 3. Vercel (10 min) — Status: DONE

Deployed at `https://trustlabel-9lvj3u4p9-hugi-jikimi.vercel.app/`, and confirmed
serving through `www.trustlabel.store` from the Seoul edge.

1. **https://vercel.com/new** → import the GitHub repo.
2. Framework preset **Next.js**, everything else default.
3. **Environment Variables** — add both `NEXT_PUBLIC_*` values for
   **Production, Preview and Development**. Miss Preview and every branch deploy
   breaks silently.
4. **Deploy.** Note the URL: `https://trustlabel-9lvj3u4p9-hugi-jikimi.vercel.app/`.

---

## 3b. Connect trustlabel.store (15 min, then waiting) Status: DONE

**Do this first, tonight, before anything else on this page.** DNS is the only
step here you cannot rush — it propagates on its own schedule, and it is the one
thing that will not respond to you trying harder in the morning.

1. Vercel project → **Settings → Domains → Add** → `trustlabel.store`. Status: DONE
2.  Add `www.trustlabel.store` too, and set one as primary. Take the apex 
   (`trustlabel.store`) as primary and let `www` redirect to it — the embed URL
   is going into other people's HTML, and the shorter one is the one you want
   living there for the next three years.
   **Status: DONE — apex serves directly, and `www` now redirects to it.**

   > **Verified:** `https://trustlabel.store` now returns `200` with no redirect,
   > so the embed URL costs one round trip instead of two. That was the part that
   > mattered — the tag goes into a stranger's page source for years.
   >
   > **Still open:** both hosts serve the app independently, so there is no
   > canonical one. Vercel's domain dialog offers each domain a choice of
   > **Production** or **Redirect** — set:
   >
   > | Domain | Set to |
   > |---|---|
   > | `trustlabel.store` | Production |
   > | `www.trustlabel.store` | Redirect → `trustlabel.store` |
   >
   > Not cosmetic. **Supabase auth cookies are set per host.** Sign in on `www`,
   > then open the apex, and you look signed out — which is a confusing thing to
   > debug in front of a room. One canonical host means one cookie jar, and `www`
   > still works for anyone who types it out of habit.
3. Vercel shows you the DNS records to create. Two routes: Status: DONE

   | | When to use |
   |---|---|
   | **Change nameservers** to Vercel's | Simplest. Vercel manages everything. Propagation is slower (up to a few hours) |
   | **Add A / CNAME records** at your registrar | Keeps DNS where it is, usually faster to take effect |

   **Use the exact values Vercel displays.** Do not copy an IP from a blog post
   or from me — Vercel has changed its anycast addresses before, and a stale A
   record fails in a way that looks like a certificate problem.

4. Wait for Vercel to show **Valid Configuration**. TLS is provisioned 
   automatically once DNS resolves; there is nothing to buy or upload. Status: DONE
5. Verify from a terminal rather than trusting the dashboard: Status: DONE

   ```bash
   dig +short trustlabel.store
   curl -sI https://trustlabel.store | head -3
   ```

6. **Now** go to **Supabase → Authentication → URL Configuration**: Status: DONE
   - **Site URL** → `https://trustlabel.store`
   - Redirect URLs keep all of: `https://trustlabel.store/**`,
     `https://*.vercel.app/**`, `http://localhost:3000/**`

**Test the round trip tonight:** open `https://trustlabel.store`, sign in with a
magic link, confirm it lands on `/dashboard`. If that works this evening, the two
riskiest parts of tomorrow — DNS and email — are both already behind you.

**Status: DONE — a magic link was sent, arrived, opened, and landed on
`/dashboard`.** Both of the risky outside dependencies, DNS and email, are
behind you.

Two things worth remembering about that flow. The links are **PKCE**, so one
must be opened in the same browser that asked for it — click it from a mail
client that opens a different browser and it fails with a generic error. And
Supabase's built-in mailer allows only **a couple of sends per hour** with a
60-second cooldown per address, so test deliberately rather than by retrying.
If delivery ever goes bad, the route around it is custom SMTP.

---

## 4. Supabase client files Status: DONE

Three small files. Write them once and forget them.

`lib/supabase/client.js` — browser
```js
"use client";
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

`lib/supabase/server.js` — server components and route handlers
```js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const store = await cookies();          // async in Next 15+
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try { list.forEach(({ name, value, options }) => store.set(name, value, options)); }
          catch { /* called from a Server Component; middleware refreshes instead */ }
        },
      },
    }
  );
}
```

`app/auth/callback/route.js` — exchanges the magic-link code
```js
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

Sending the link:
```js
await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
});
```

---

## 5. Seed a demo row (do this tonight too) Status: DONE — a published row exists, made through the wizard rather than by hand

After signing in once, find your user id in **Authentication → Users**, then:

```sql
insert into public.disclosures
  (owner_id, slug, shop_name, reviewer_scope, posting_period,
   uses_ai_ranking, ai_criteria, deletion_criteria, published, lines_json)
values
  ('YOUR-USER-UUID', 'demo', '해피몰',
   'verified', 'permanent', true, array['detail','photo'], 'policy', true,
   '["1. 사용후기 작성 권한: 실제 구매(결제)가 확인된 고객에게 작성 권한이 있습니다.","2. 게시기간: 등록된 후기는 삭제 요청 전까지 영구히 게시됩니다.","3. 평가·순위 기준: 알고리즘이 다음 기준에 따라 후기의 노출 순서를 정합니다 — 후기의 구체성 및 분량, 사진·영상 첨부 여부.","4. 삭제 기준 및 이의제기: 운영정책을 위반한 경우 해당 후기를 삭제하거나 비공개 처리할 수 있으며, 작성자는 고객센터를 통해 이의를 제기할 수 있습니다."]'::jsonb);
```

Now `/d/demo` works before you have written the wizard, and your dashboard is
never empty on screen.

---

## 6. Things that will bite you — reference, nothing to do

| Symptom | Cause |
|---|---|
| Magic link opens and logs you out | Redirect URL not in the allow-list, or Site URL still localhost in production |
| `params.slug` is undefined | Next 15+ makes `params` a Promise — `const { slug } = await params` |
| Public page 404s for everyone but you | `published` is false, or the anon read policy was not created |
| Embed throws a syntax error on the host page | A failure path returned HTML. Every path must return JS |
| Works locally, blank on Vercel | Env vars not added to the Preview environment |
| Domain shows a certificate warning | DNS has not fully propagated, or an A record points at a stale Vercel IP |
| Magic link works on vercel.app but not the domain | Site URL still points at the Vercel hostname |
| `cookies()` error in a Server Component | Use the try/catch `setAll` above; middleware does the refresh |
| Korean renders as boxes | Add `Noto Sans KR` via `next/font/google` |

---

## 7. Fifteen minutes before you present

- [ ] `https://trustlabel.store` loads over HTTPS with no warning 
- [ ] Signed in, dashboard open, demo row visible
- [ ] Scratch `demo.html` open in the editor, script tag commented out
- [ ] Public page loaded in a second tab
- [ ] Phone ready to scan the QR
- [ ] Laptop on the room's wifi, tested
- [ ] Browser zoom at 125% — projectors are unkind
- [ ] Dark mode matching the room's lighting
