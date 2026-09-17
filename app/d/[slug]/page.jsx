import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { cache } from "react";
import Label from "@/components/Label";
import { getBySlug } from "@/lib/disclosures";
import { HEADING } from "@/lib/generate";
import { COPY } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

// generateMetadata and the page body both need the row. React.cache dedupes it
// to one round trip per request instead of two.
const load = cache(async (slug) => {
  const supabase = await createClient();
  const { data } = await getBySlug(supabase, slug);
  // getBySlug deliberately does not filter on `published` — an owner can read
  // their own draft. A public URL must not serve one, so the check lives here.
  return data?.published ? data : null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const row = await load(slug);

  if (!row) return { title: `TrustLabel` };

  const shop = row.shop_name?.trim();
  return {
    title: shop ? `${shop} · ${HEADING}` : HEADING,
    description: shop
      ? `${shop}의 사용후기 수집·처리 정보공개입니다.`
      : "사용후기 수집·처리 정보공개입니다.",
  };
}

export default async function PublicDisclosurePage({ params }) {
  const { slug } = await params;
  const row = await load(slug);

  if (!row) notFound();

  const shop = row.shop_name?.trim();
  const lines = (row.lines_json ?? []).map((text) => ({ text, dim: false }));

  // Absolute, because the QR is scanned by a phone that has no idea what host
  // rendered the page.
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const proto =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const pageUrl = `${proto}://${host}/d/${row.slug}`;

  // Ink on white whatever the theme — a dark-on-dark QR does not scan.
  const qr = await QRCode.toDataURL(pageUrl, {
    margin: 1,
    width: 360,
    color: { dark: "#16191D", light: "#FFFFFF" },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-20 sm:py-28">
      {shop ? <p className="mb-5 text-[13px] text-ink-muted">{shop}</p> : null}

      <Label lines={lines} shopName={shop} />

      <div className="mt-10 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- a data URI, nothing for next/image to optimise */}
        <img
          src={qr}
          alt={`${pageUrl} QR`}
          width={144}
          height={144}
          className="rounded-lg border border-rule bg-white p-2"
        />
        <p className="mt-3 text-[12px] text-ink-faint">{pageUrl}</p>
      </div>

      <p className="mt-10 max-w-[640px] text-[12px] leading-relaxed text-ink-muted">
        {COPY.ko.disclaimer}
      </p>
    </main>
  );
}
