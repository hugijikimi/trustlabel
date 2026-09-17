import { HEADING } from "@/lib/generate";

/**
 * The Label — DESIGN.md §3. The disclosure block, the thing people photograph.
 *
 * Presentational and server-safe: the wizard passes lines with `dim` set for
 * unanswered slots, the public page passes the saved snapshot with none. One
 * component so the two can never drift apart.
 *
 * `lines` is an array of { text, dim }.
 */
export default function Label({ lines = [], shopName, shopPlaceholder = "", animate = false }) {
  return (
    <section className="w-full max-w-[640px] rounded-card border border-rule bg-card p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="font-display text-[20px] leading-snug font-semibold text-ink">{HEADING}</h2>
      <div className="mt-2 h-[3px] w-11 bg-seal" aria-hidden="true" />

      <div className="mt-6">
        {lines.map((line, index) => (
          <p
            key={`${index}-${line.text}`}
            className={
              line.dim
                ? "mb-3 text-[16px] leading-[1.9] text-ink-faint opacity-70"
                : animate
                  ? "mb-3 animate-line-in text-[16px] leading-[1.9] text-ink motion-reduce:animate-none"
                  : "mb-3 text-[16px] leading-[1.9] text-ink"
            }
          >
            {line.text}
          </p>
        ))}
      </div>

      <p className="mt-8 text-[12px] text-ink-faint">
        {shopName?.trim() || shopPlaceholder} · TrustLabel로 생성
      </p>
    </section>
  );
}
