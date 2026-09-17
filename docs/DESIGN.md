# TrustLabel — UI design

The public page will be on a projector, and the judges will see the screen before
they hear the pitch. Design accordingly: **fewer things, larger, with real
whitespace.** A crowded screen reads as unfinished even when it is not.

The governing idea: the disclosure is a **label** — like a nutrition panel or a
certification seal. Something a shop displays with a little pride, not a legal
notice buried in a footer. Every design choice below serves that reframe, and so
does the pitch.

---

## 1. Tokens

Tailwind v4, CSS-first. Paste into `app/globals.css`.

```css
@import "tailwindcss";

@theme {
  /* Ground — warm paper, not clinical white. Reads as a printed label. */
  --color-paper:      #FAF8F4;
  --color-card:       #FFFFFF;
  --color-ink:        #16191D;
  --color-ink-muted:  #5A6068;
  --color-ink-faint:  #8C939C;
  --color-rule:       #E8E3DA;
  --color-rule-strong:#D6CFC2;

  /* Accent — deep teal-green. Trust, without defaulting to SaaS blue. */
  --color-seal:       #0E7C66;
  --color-seal-tint:  #E6F2EE;

  /* Deadline urgency */
  --color-amber:      #B4690E;
  --color-amber-tint: #FBF0DE;

  /* The fine */
  --color-brick:      #A93226;
  --color-brick-tint: #FAEBE9;

  --font-display: "Noto Serif KR", ui-serif, Georgia, serif;
  --font-sans:    "Inter", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif;

  --radius-card: 14px;
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-paper:      #121417;
    --color-card:       #1A1D21;
    --color-ink:        #EDEAE4;
    --color-ink-muted:  #9AA1A9;
    --color-ink-faint:  #6C737B;
    --color-rule:       #282C31;
    --color-rule-strong:#3A3F45;
    --color-seal-tint:  #10302A;
    --color-amber-tint: #2E2210;
    --color-brick-tint: #2E1614;
  }
}
```

Fonts via `next/font/google` in `app/layout.jsx`:

```js
import { Inter, Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
```

Load `Noto Sans KR` even in the English UI. The **output is always Korean**, so
every screen renders Hangul somewhere. Skip it and your demo shows boxes.

---

## 2. Type scale

| Use | Size / weight | Font |
|---|---|---|
| Hero | 44–56px, 600 | display |
| Page title | 28px, 600 | display |
| Section | 17px, 600 | sans |
| Body | 15px / 1.7 | sans |
| **Disclosure line** | **16px / 1.9** | sans |
| Meta, captions | 12px | sans |

The disclosure itself gets the most generous line-height on the page. It is the
product; everything else is packaging.

---

## 3. Components

**Button (primary)** — `bg-ink text-white rounded-lg px-5 py-2.5 text-sm hover:opacity-90`
**Button (secondary)** — `border-[1.5px] border-rule-strong bg-card rounded-lg px-5 py-2.5 text-sm`
**Card** — `bg-card border border-rule rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]`

**Status pill**
- Live → `bg-seal-tint text-seal` · Draft → `bg-paper text-ink-muted border border-rule`

**The Label** — the disclosure block, the thing people will photograph:

```
┌──────────────────────────────────────┐
│  사용후기 수집·처리 정보공개          │  ← display font, 20px, seal underline
│  ────────────────────────────        │
│  1. 사용후기 작성 권한: …            │  ← 16px / 1.9, generous
│  2. 게시기간: …                      │
│  3. 평가·순위 기준: …                │
│  4. 삭제 기준 및 이의제기: …         │
│                                      │
│  해피몰 · TrustLabel로 생성          │  ← 12px, ink-faint
└──────────────────────────────────────┘
```

Rules: max-width **640px**, `bg-card`, 32px padding, a 3px `seal` rule under the
heading. Never centre the body lines — Korean legal text left-aligns, and centred
paragraphs read as a certificate parody.

---

## 4. Screens

### Landing `/` — also the waitlist
Split hero. **Left:** headline, one sentence, one button, a small countdown to
2026-10-22. **Right:** a real rendered Label, slightly tilted with a soft shadow,
so the product is visible before anyone signs up.

Headline — EN: *"Your reviews policy, published in 90 seconds."*
KO: *"사용후기 정보공개, 90초면 끝납니다."*

Below the fold, in order: three screenshots captioned Answer → Publish → Paste
one line, then the waitlist form, then a plain line stating the deadline and the
₩10,000,000 penalty. State the fine once, in text, without a red alarm box.
Understatement is more credible than urgency styling, and the number does the work.

**The waitlist form.** Three fields at most, and only the email required — every
extra field costs signups, and you can ask a person anything once they are on the
list. On success the form is *replaced* by a confirmation rather than flashing a
toast: a toast that vanishes leaves someone unsure whether it worked, and they
submit again.

Sized for a thumb, because the acceptance test is a neighbour on their own phone:

| | |
|---|---|
| Input font-size | **16px minimum** — below that iOS zooms on focus and the layout jumps |
| Submit button | full width on mobile, ≥48px tall, still reachable once the keyboard opens |
| While sending | disabled, label changes — a double tap must not double submit |

**No invented signup counts, no fake testimonials, no logo wall.** Demo data
inside the product is fiction everyone understands. A number on a live public
page is a claim to a real visitor, and inventing that is a different thing.

### Wizard `/wizard`
`grid lg:grid-cols-[1fr_1fr] gap-10`. One question per screen — never a long
form. Progress dots, not a percentage bar.

**Right column is the demo.** The Label renders live; each new line fades and
slides in over 250ms as it is answered. Unanswered lines show as dimmed
placeholders so the shape of the finished thing is visible from question one.

Answer options are **cards, not radio buttons**: 56px tall, name plus a one-line
explanation, selected state = `border-ink` + `bg-seal-tint`. Big enough to hit on
a phone and to read from the back of a room.

### Dashboard `/dashboard`
Cards in a `sm:grid-cols-2` grid. Each shows shop name, status pill, the public
URL with a copy button, and Edit / Publish / Check.

Empty state matters — it is on screen whenever a judge follows along on their own
phone: a dashed-border card, one line of copy, one button. Never a blank region.

### Public page `/d/[slug]`
Centred, `max-w-2xl`, vertically generous. Shop name small above the Label, the
Label as hero, then the QR code and the disclaimer line. Nothing else. No nav, no
marketing, no cookie banner. It should feel like a certificate, and it should
survive being projected at 30% of a wall.

---

## 5. The embed renderer

Runs inside someone else's page, so it must be defensive: no innerHTML, no global
leakage, inline styles only (their CSS is not yours and yours is not theirs).

```js
export function renderScript({ heading, lines }) {
  const data = JSON.stringify({ heading, lines });   // safe: JSON, not interpolation
  return `(function(){
  var d=${data};
  var s=document.currentScript;
  var box=document.createElement("section");
  box.setAttribute("data-trustlabel","");
  box.style.cssText="max-width:640px;margin:24px 0;padding:24px;border:1px solid #E8E3DA;border-radius:14px;background:#fff;font-family:system-ui,-apple-system,'Noto Sans KR',sans-serif;color:#16191D";
  var h=document.createElement("h2");
  h.textContent=d.heading;
  h.style.cssText="margin:0 0 4px;font-size:17px;font-weight:600";
  var rule=document.createElement("div");
  rule.style.cssText="height:3px;width:44px;background:#0E7C66;margin:0 0 16px";
  box.appendChild(h);box.appendChild(rule);
  d.lines.forEach(function(t){
    var p=document.createElement("p");
    p.textContent=t;                                  // never innerHTML
    p.style.cssText="margin:0 0 10px;font-size:14px;line-height:1.85";
    box.appendChild(p);
  });
  if(s&&s.parentNode){s.parentNode.insertBefore(box,s);}else{document.body.appendChild(box);}
})();`;
}
```

`JSON.stringify` is doing real work: it produces a valid JS literal with quotes
and newlines escaped, so a shop name containing `</script>` or a quote cannot
break out. Worth saying if a judge asks how you handled injection.

---

## 6. Motion

Three animations, no more.
- Disclosure line entering the preview: 250ms fade + 6px rise.
- Copy button: swap to a check for 1.5s.
- Publish: the status pill crossfades Draft → Live.

Everything else instant. Respect `prefers-reduced-motion`.

---

## 7. Projector checklist

- Body text never below 14px on the public page
- Contrast: `ink` on `paper` is ~13:1; keep `ink-faint` off anything that matters
- Test at 125% browser zoom — that is roughly how a projector reads
- Dark mode actually implemented, not just inverted
- No `text-ink-faint` on `bg-paper` for anything a judge needs to read
