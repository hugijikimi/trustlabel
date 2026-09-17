# TrustLabel — one-day build spec

**What it is.** Korean online sellers must publish how they handle customer
reviews — who may write them, how long they stay up, whether an algorithm ranks
them, when they get deleted — before **2026-10-22**. Most have no idea. Missing
it costs up to **₩10,000,000**.

TrustLabel turns that obligation into a 90-second wizard, a public page, and one
line of HTML.

**How to use this document.** §1–§4 are reference material. §5 is the build: a
sequence of briefs written in GOAL / MATERIALS / OUTPUT form, each one small
enough to paste into an agent, run, and look at before the next. Work down the
list. Do not paste two at once.

Live at **https://trustlabel.store** · setup status in [SETUP.md](SETUP.md)

---

## 0. Working rules

**Fictional data only.** Every shop name, review, email and screenshot is
invented. Nothing real, nothing confidential.

> One line worth separating out: **do not fabricate traction.** A made-up shop
> called 해피몰 in a demo is fine — everyone understands a demo. "2,431 sellers
> already waiting" on a live public page is not a fiction, it is a false claim to
> a real visitor. Invent freely inside the product; never invent evidence about
> the product.

**Propose → Confirm → Execute.** The agent says what it is about to do; you read
it; you approve. You are the manager and it is a fast junior — the value is in
you catching the wrong plan before it becomes a hundred lines of wrong code.

**One change at a time.** Ask for one thing, look at the result, ask for the
next. Ten changes at once is ten surprises, and no way to tell which of them
broke the build.

**The generated disclosure text is always Korean**, whatever the UI language.
That is a legal requirement, not a preference — Korean consumers are the ones
who must be able to read it. The language toggle changes chrome only. This is
also a good line in the pitch.

> **Demo disclaimer that must ship:** this generates a draft for demonstration.
> It is not legal advice and has not been reviewed by a lawyer. It goes in the
> footer and on the public page. One line, and it is the difference between
> confident and reckless.

---

## 1. Scope

**In**
1. Bilingual UI (English / Korean), switchable, persisted.
2. Magic-link sign-in (Supabase Auth).
3. Five-question wizard with the disclosure building live beside you.
4. Save → a public page at `/d/<slug>`.
5. Dashboard: list, edit, publish/unpublish, delete.
6. One-line embed snippet that renders the disclosure on any site.
7. QR code + social preview image for the public page.
8. Install checker: paste your storefront URL, we fetch it and say whether the
   disclosure is actually showing.
9. Public landing page with a waitlist form.

**Out** — say these out loud in the pitch as *deliberate*, not missing: payments,
audit trails, hash chains, law-firm certification, monitoring, SMS, roles, teams.

---

## 2. MATERIALS — database

Three tables. Paste as-is.

```sql
-- ─── disclosures ─────────────────────────────────────────────────────────────
create table public.disclosures (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users(id) on delete cascade,
  slug              text not null unique,
  shop_name         text not null default '',

  reviewer_scope    text,          -- 'verified' | 'members' | 'anyone'
  posting_period    text,          -- 'permanent' | 'until_requested' | '3years' | '1year'
  uses_ai_ranking   boolean,
  ai_criteria       text[],        -- subset of: 'detail','photo','recency','helpful','purchase'
  deletion_criteria text,          -- 'policy' | 'ads' | 'defamation' | 'onrequest'
  external_sources  text,          -- null, or a platform name

  lines_json        jsonb,         -- generated Korean lines, snapshotted on save
  published         boolean not null default false,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index disclosures_owner_idx on public.disclosures (owner_id, updated_at desc);
create index disclosures_slug_idx  on public.disclosures (slug) where published;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger disclosures_touch before update on public.disclosures
  for each row execute function public.touch_updated_at();

-- ─── install checks ──────────────────────────────────────────────────────────
create table public.install_checks (
  id            uuid primary key default gen_random_uuid(),
  disclosure_id uuid not null references public.disclosures(id) on delete cascade,
  checked_at    timestamptz not null default now(),
  url           text not null,
  found         boolean,           -- null = we could not check
  http_status   integer,
  error         text
);

create index install_checks_idx on public.install_checks (disclosure_id, checked_at desc);

-- ─── waitlist ────────────────────────────────────────────────────────────────
create table public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  shop_name  text,
  platform   text,                 -- 'cafe24' | 'naver' | 'imweb' | 'other'
  created_at timestamptz not null default now(),
  unique (email)
);
```

### RLS — copy exactly

```sql
alter table public.disclosures    enable row level security;
alter table public.install_checks enable row level security;
alter table public.waitlist       enable row level security;

-- Owners do anything with their own rows.
create policy disclosures_owner_all on public.disclosures
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Anyone may read a PUBLISHED disclosure. This is what makes the public page and
-- the embed work without a service-role key — one less secret to leak and one
-- less thing to misconfigure on stage.
create policy disclosures_public_read on public.disclosures
  for select to anon
  using (published = true);

create policy checks_owner_read on public.install_checks
  for select to authenticated
  using (exists (select 1 from public.disclosures d
                 where d.id = install_checks.disclosure_id and d.owner_id = auth.uid()));

create policy checks_owner_insert on public.install_checks
  for insert to authenticated
  with check (exists (select 1 from public.disclosures d
                      where d.id = install_checks.disclosure_id and d.owner_id = auth.uid()));

-- Anyone may JOIN the waitlist. Nobody may read it.
--
-- The insert policy with no matching select policy is the whole point: a
-- waitlist table that anon can select is a public dump of everyone's email
-- address. Read it from the Supabase dashboard instead.
create policy waitlist_anon_insert on public.waitlist
  for insert to anon
  with check (true);
```

**Known trade-off, state it if asked:** the anon read policy on `disclosures`
exposes every column of a published row, including `owner_id`. A real product
would read through a server route with a service key and return only what the
page needs. For a one-day MVP this is the right call — fewer secrets, fewer
failure modes — and knowing *why* you chose it is worth more to a judge than
having chosen the other.

---

## 3. MATERIALS — the generator

One pure function. No dependencies, trivially testable, and the heart of the demo.

`lib/generate.js`

```js
export const LABELS = {
  reviewer_scope: {
    verified: "실제 구매(결제)가 확인된 고객",
    members:  "회원 가입을 완료한 고객",
    anyone:   "누구나",
  },
  posting_period: {
    permanent:       "삭제 요청 전까지 영구히",
    until_requested: "작성자가 삭제를 요청하기 전까지",
    "3years":        "작성일로부터 3년간",
    "1year":         "작성일로부터 1년간",
  },
  ai_criteria: {
    detail:   "후기의 구체성 및 분량",
    photo:    "사진·영상 첨부 여부",
    recency:  "작성 시점",
    helpful:  "다른 고객의 도움돼요 수",
    purchase: "실제 구매 확인 여부",
  },
  deletion_criteria: {
    policy:     "운영정책을 위반한 경우",
    ads:        "광고·홍보성 내용인 경우",
    defamation: "욕설·비방·명예훼손에 해당하는 경우",
    onrequest:  "작성자가 삭제를 요청한 경우",
  },
};

export const HEADING = "사용후기 수집·처리 정보공개";

/** Always Korean. Takes no language argument — that is the point. */
export function generateLines(a = {}) {
  const L = (group, key) => LABELS[group][key] ?? "미입력";
  const lines = [];

  lines.push(`1. 사용후기 작성 권한: ${L("reviewer_scope", a.reviewer_scope)}에게 작성 권한이 있습니다.`);
  lines.push(`2. 게시기간: 등록된 후기는 ${L("posting_period", a.posting_period)} 게시됩니다.`);

  if (a.uses_ai_ranking) {
    const picked = (a.ai_criteria ?? []).map((k) => L("ai_criteria", k)).join(", ") || "기준 미입력";
    lines.push(`3. 평가·순위 기준: 알고리즘이 다음 기준에 따라 후기의 노출 순서를 정합니다 — ${picked}.`);
  } else {
    lines.push(`3. 평가·순위 기준: 별도의 알고리즘 기반 순위 조정 없이 최신순으로 표시합니다.`);
  }

  lines.push(
    `4. 삭제 기준 및 이의제기: ${L("deletion_criteria", a.deletion_criteria)} 해당 후기를 삭제하거나 비공개 처리할 수 있으며, ` +
    `작성자는 고객센터를 통해 이의를 제기할 수 있습니다.`
  );

  if (a.external_sources) {
    lines.push(`5. 외부 플랫폼 후기: ${a.external_sources}의 후기를 함께 표시하고 있습니다.`);
  }
  return lines;
}

export function toPlainText(lines) {
  return [HEADING, "", ...lines].join("\n");
}

export function toHtml(lines) {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  return [
    `<section class="trustlabel">`,
    `  <h2>${esc(HEADING)}</h2>`,
    ...lines.map((l) => `  <p>${esc(l)}</p>`),
    `</section>`,
  ].join("\n");
}
```

**Escape the seller's free text.** `external_sources` is user input that ends up
on other people's pages. `toHtml` escapes; the embed builds DOM with
`textContent`. Mention this if a judge asks about security — it is a real answer,
not a hand-wave.

---

## 4. MATERIALS — routes

| Path | Render | Auth | Purpose |
|---|---|---|---|
| `/` | server | none | Landing + waitlist |
| `/login` | client | none | Email → magic link |
| `/auth/callback` | route | none | Exchange the code, redirect to `/dashboard` |
| `/wizard` | client | required | 5 questions, live preview |
| `/dashboard` | client | required | List, edit, publish, delete, install checker |
| `/d/[slug]` | **server** | none | Public page. Must be SSR for link previews |
| `/api/embed/[slug]` | route | none | Returns JavaScript |
| `/api/check` | route | required | Fetches a storefront, reports whether found |
| `/d/[slug]/opengraph-image` | route | none | Social preview image |

The embed URL ends up **inside other people's page source, permanently**. It is
not a marketing link, it is a piece of their production HTML that a developer or
an auditor will read in three years:

```html
<script src="https://trustlabel.store/api/embed/abc123" async></script>
```

---

## 5. The build — twelve briefs

Paste one. Look at the result. Then the next.

Every brief inherits the same standing context, so you do not have to repeat it:

> **Project:** Next.js App Router, JavaScript (no TypeScript), Tailwind v4,
> Supabase (`@supabase/ssr`), deployed on Vercel at trustlabel.store.
> Design tokens and component specs are in `docs/DESIGN.md`.
> Propose your plan before writing code. Change one thing at a time.

---

### B1 · Database — 20 min

**GOAL** — Every table, index, trigger and RLS policy the app needs exists in
Supabase, and a signed-out client can read a published disclosure but nothing else.

**MATERIALS** — §2 of this document, verbatim. Supabase SQL Editor.

**OUTPUT** — Nothing in the repo. Run the SQL in the dashboard and confirm three
tables under Table Editor. Then, in the SQL Editor, verify RLS actually bites:

```sql
set local role anon;
select count(*) from public.disclosures;   -- expect 0, not an error
select count(*) from public.waitlist;      -- expect 0 rows readable
reset role;
```

**DONE WHEN** — the three tables exist and `anon` sees zero rows in `waitlist`.

---

### B2 · Shell, tokens, language toggle — 45 min

**GOAL** — The app has its visual identity, a persistent EN/KO toggle, and a
layout every page inherits.

**MATERIALS** — `docs/DESIGN.md` §1 (tokens) and §2 (type scale). Fonts via
`next/font/google`: Inter, Noto Serif KR, Noto Sans KR.

**OUTPUT**
- `app/globals.css` — the `@theme` block from `docs/DESIGN.md` §1, light and dark
- `app/layout.jsx` — fonts, `<html lang>`, footer with the disclaimer line
- `lib/i18n.js` — `const COPY = { en: {...}, ko: {...} }`, one flat object per
  language with identical keys
- `components/LangToggle.jsx` — persists to `localStorage`, defaults to `ko`

**DONE WHEN** — toggling the language changes the chrome and survives a reload.

> Load `Noto Sans KR` even in the English UI. The output is always Korean, so
> every screen renders Hangul somewhere. Skip it and your demo shows boxes.

---

### B3 · Magic-link auth — 30 min

**GOAL** — I can sign in with an emailed link and land on `/dashboard`; signed
out, `/dashboard` sends me to `/login` rather than erroring.

**MATERIALS** — `SETUP.md` §4 (the three client files, verbatim). Supabase URL
configuration is already done — see SETUP.md §3b.

**OUTPUT**
- `lib/supabase/client.js`, `lib/supabase/server.js`, `app/auth/callback/route.js`
- `app/login/page.jsx` — one email field, one button, three states: idle,
  sent ("Check your email"), error
- `app/dashboard/page.jsx` — a stub that shows the signed-in email

**DONE WHEN** — a magic link arrives, opens, and lands on `/dashboard`.

> **Do this brief first thing in the morning, before B2 if you like.** Email is
> the only dependency outside the room. Prove it at hour one, with a whole day to
> route around a spam folder, not at hour seven.

---

### B4 · The generator — 20 min

**GOAL** — A pure function turns five answers into the Korean disclosure lines.

**MATERIALS** — §3 of this document, verbatim. Do not rewrite the Korean strings.

**OUTPUT** — `lib/generate.js` exactly as given, plus `lib/generate.test.mjs`
with four cases runnable by `node --test`: all answers present; AI ranking off;
AI ranking on with two criteria; no external sources (expect four lines, not five).

**DONE WHEN** — `node --test lib/generate.test.mjs` passes.

---

### B5 · Wizard with live preview — 90 min

**GOAL** — Five questions, one per screen, with the Korean disclosure building
line by line beside them. This is the demo; everything else is packaging.

**MATERIALS** — `lib/generate.js` from B4. `docs/DESIGN.md` §4 "Wizard". Questions and
option values: §2's column comments in this document.

**OUTPUT** — `app/wizard/page.jsx` and `components/LabelPreview.jsx`.
- Two columns on `lg:`, stacked below
- Answer options are cards ~56px tall with a one-line explanation, not radios
- Q3 asks for criteria only if AI ranking is yes; Q5 asks for a name only if yes
- Unanswered lines show as dimmed placeholders from question one
- New lines fade in over 250ms, respecting `prefers-reduced-motion`

**DONE WHEN** — answering question one makes Korean text appear on the right.

---

### B6 · Save, slug, publish — 45 min

**GOAL** — A finished wizard saves to Supabase, gets a short public slug, and can
be published.

**MATERIALS** — `disclosures` table from B1. `generateLines` from B4.

**OUTPUT**
- `lib/slug.js` — 8 characters from an unambiguous alphabet (no `0 O 1 I l`),
  retry on unique violation
- `lib/disclosures.js` — `save`, `publish`, `unpublish`, `listMine`, `getBySlug`
- Wizard final step: shop name field, Save, then Publish

**DONE WHEN** — after saving, the row is visible in the Supabase Table Editor
with `lines_json` populated.

> Snapshot `lines_json` at save time rather than regenerating on read. The public
> page then serves exactly what was approved, and a later change to the generator
> cannot silently rewrite a disclosure someone already published.

---

### B7 · Dashboard — 45 min

**GOAL** — Come back later and see my disclosures, edit them, publish them.

**MATERIALS** — `lib/disclosures.js` from B6. `docs/DESIGN.md` §4 "Dashboard".

**OUTPUT** — `app/dashboard/page.jsx`: cards, not a table. Each shows shop name,
a Draft/Live pill, the public URL with a copy button, and Edit / Publish / Delete.
Plus an empty state — a dashed card, one line, one button.

**DONE WHEN** — refresh the page and your work is still there.

---

### B8 · Public page — 45 min

**GOAL** — `trustlabel.store/d/<slug>` shows the disclosure, looks finished, and
survives being projected.

**MATERIALS** — `getBySlug` from B6. `docs/DESIGN.md` §4 "Public page".

**OUTPUT** — `app/d/[slug]/page.jsx`, server-rendered.
- `max-w-2xl`, centred, generous vertical space
- Shop name small above, the Label as hero, disclaimer line below
- `export async function generateMetadata()` — title, description
- Unpublished or unknown slug → `notFound()`, not a crash

**DONE WHEN** — the page loads in a private window, and a bad slug shows a clean
404.

> `params` is a Promise in Next 15+: `const { slug } = await params`.

---

### B9 · QR code and link preview — 30 min

**GOAL** — The public page has a QR code on it and previews properly when the
link is pasted into KakaoTalk.

**MATERIALS** — the `qrcode` package. `next/og` for the image.

**OUTPUT**
- QR rendered server-side to a data URI on `/d/[slug]`
- `app/d/[slug]/opengraph-image.jsx` using `ImageResponse` — shop name, the
  heading, the TrustLabel wordmark, 1200×630

**DONE WHEN** — you scan the QR with your phone and land on the page.

---

### B10 · The embed — 60 min

**GOAL** — One line of HTML renders the disclosure on any site.

**MATERIALS** — `docs/DESIGN.md` §5 (`renderScript`, verbatim). §4 of this document.

**OUTPUT** — `app/api/embed/[slug]/route.js` returning
`application/javascript`, with:
- `access-control-allow-origin: *`
- `cache-control: public, s-maxage=60, stale-while-revalidate=86400`
- **every** failure path returning valid JS — a 404 that returns HTML throws a
  syntax error inside someone else's page
- DOM built with `createElement` / `textContent`, inline styles only
- inserted relative to `document.currentScript`

Also create `demo.html` at the repo root: a bare HTML file with some fake product
content and the script tag, for the demo.

**DONE WHEN** — `demo.html` opened from disk shows the label.

---

### B11 · Install checker — 45 min

**GOAL** — Paste a storefront URL and find out whether the disclosure is actually
showing.

**MATERIALS** — `install_checks` table from B1.

**OUTPUT** — `app/api/check/route.js` plus a form on the dashboard card.
- `http:` / `https:` only
- **Refuse localhost, 127.x, 10.x, 172.16–31.x, 192.168.x, 169.254.x, `.local`.**
  Without this you have built an open proxy into your own network
- 10s timeout, cap the body at ~1MB
- Found = the page contains the heading **or** the embed URL
- **Three outcomes, never two:** found / not found / could not check

**DONE WHEN** — checking your own public page says found, and
`http://localhost:3000` is refused.

> Never collapse "could not check" into "not found". *We could not reach your
> page* is not *your disclosure is missing*, and one of those is an accusation.

---

### B12 · Landing page and waitlist — 60 min

**GOAL** — A stranger lands on trustlabel.store, understands the problem in ten
seconds, sees what the product does, and joins the waitlist from their phone.

**MATERIALS** — `waitlist` table from B1. `docs/DESIGN.md` §4 "Landing". Three real
screenshots of your own build: the wizard mid-answer, the public page, the
dashboard. Fictional shop data only.

**OUTPUT** — `app/page.jsx`, server-rendered, with five sections in order:

1. **Problem** — the deadline, the statute (전자상거래법 제21조의4), the
   ₩10,000,000 penalty. State the fine once, in text, without a red alarm box.
   Understatement is more credible than urgency styling; the number does the work.
2. **Solution** — one sentence and a rendered example Label.
3. **Three screens** — the screenshots, captioned: *Answer five questions* /
   *Publish a public page* / *Paste one line*.
4. **Waitlist form** — email (required), shop name and platform (optional),
   inserted straight to Supabase from the browser under the anon insert policy.
5. **Footer** — the not-legal-advice line.

Form behaviour:
- Success → the form is replaced by a confirmation, not a toast that vanishes
- Duplicate email → *"You're already on the list"*, treated as success, not an error
- Invalid email → say what is wrong and how to fix it
- Disable the button while submitting so a double tap does not double submit

**DONE WHEN** — your neighbour joins the waitlist from their own phone, and the
row appears in the Supabase Table Editor while you watch.

> **Test it on a real phone, not a resized browser window.** Thumb-reachable
> button, 16px minimum on the input so iOS does not zoom on focus, and the
> keyboard must not cover the submit button.
>
> **No invented signup counts, no fake testimonials, no logo wall.** The page is
> real and public; the fiction budget is for the demo data inside the product,
> not for claims about the product.

---

## 6. Order and cuts

Suggested order: **B3 → B1 → B2 → B4 → B5 → B6 → B7 → B8 → B12 → B10 → B9 → B11.**

B3 first because email is the outside dependency. B12 before B10 because the
waitlist is the thing a neighbour has to be able to reach; the embed is the thing
that makes the room clap.

**If you fall behind, cut in this order:** B9 (QR) → B11 (checker) → dark mode.
Never cut B5 or B10 — the live preview and the embed *are* the demo.

---

## 7. Demo script — four minutes

1. **The problem (30s).** Every Korean online seller must publish this by
   October 22. Fine is ₩10,000,000. Show a storefront with no disclosure.
2. **The wizard (90s).** Answer five questions. Let the room watch the Korean
   text write itself.
3. **Publish (30s).** One click. Public page on the projector. Scan the QR.
4. **The embed (60s).** Paste one line into `demo.html`, reload, the label
   appears. *This is the applause line.*
5. **The checker (30s).** Paste the URL back, it confirms it is live.
6. **Close (30s).** "Ninety seconds, no lawyer, no developer." Name what you left
   out deliberately, and point at the waitlist.

### Demo safety
- **Sign in before you present.** Have the tab open and authenticated.
- Seed one finished disclosure so the dashboard is never empty on screen.
- `demo.html` open in the editor with the script tag already commented out —
  uncomment, save, reload.
- Keep a published page URL in your notes in case live signup misbehaves.

---

## 8. Acceptance checklist

- [ ] UI toggles EN/KO and the choice survives a reload
- [ ] Generated disclosure is Korean in both UI languages
- [ ] Unauthenticated `/dashboard` redirects to `/login`, does not error
- [ ] A published page loads in a private window
- [ ] An unpublished slug returns a clean 404, not a stack trace
- [ ] The embed renders in `demo.html` opened from disk
- [ ] The embed returns valid JS for a bad slug
- [ ] `/api/check` refuses `http://localhost` and `http://192.168.0.1`
- [ ] The checker distinguishes "not found" from "could not check"
- [ ] The public page has a title, description and OG image
- [ ] The waitlist accepts a signup from a phone on mobile data
- [ ] A duplicate waitlist email reads as success, not an error
- [ ] `anon` cannot select from `waitlist`
- [ ] The "not legal advice" line is on the public page and the footer
- [ ] No invented numbers anywhere on the public site
