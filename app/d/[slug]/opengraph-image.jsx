import { ImageResponse } from "next/og";
import { cache } from "react";
import { getBySlug } from "@/lib/disclosures";
import { HEADING } from "@/lib/generate";
import { createClient } from "@/lib/supabase/server";

export const alt = HEADING;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WORDMARK = "TrustLabel";

const load = cache(async (slug) => {
  const supabase = await createClient();
  const { data } = await getBySlug(supabase, slug);
  return data?.published ? data : null;
});

/**
 * Satori has no system Korean font, so Hangul would render as blank boxes.
 * Google's css2 endpoint subsets to exactly the characters we pass in `text=`,
 * which keeps a 5MB family under ImageResponse's 500KB budget. The ancient
 * user-agent is deliberate: it makes Google serve woff rather than woff2, and
 * ImageResponse reads ttf/otf/woff only.
 */
async function loadSubsetFont(text) {
  const cssUrl =
    "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@600&text=" +
    encodeURIComponent(text);

  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
    },
  }).then((response) => response.text());

  const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error("No font URL in the Google Fonts response");

  return fetch(fontUrl).then((response) => response.arrayBuffer());
}

export default async function OpengraphImage({ params }) {
  const { slug } = await params;
  const row = await load(slug);
  const shop = row?.shop_name?.trim() ?? "";

  // Every glyph that will be drawn, so the subset covers all of them.
  const text = `${WORDMARK}${shop}${row ? HEADING : ""}`;

  let fonts;
  try {
    const data = await loadSubsetFont(text);
    fonts = [{ name: "Noto Sans KR", data, weight: 600, style: "normal" }];
  } catch {
    // A card in the fallback face beats a 500 where a preview should have been.
    fonts = undefined;
  }

  const korean = Boolean(fonts);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FAF8F4",
          padding: "80px",
          fontFamily: korean ? "Noto Sans KR" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#5A6068" }}>{WORDMARK}</div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 72,
              height: 8,
              backgroundColor: "#0E7C66",
              marginBottom: 36,
            }}
          />
          {shop ? (
            <div style={{ display: "flex", fontSize: 40, color: "#5A6068", marginBottom: 18 }}>
              {shop}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: 68, color: "#16191D", lineHeight: 1.25 }}>
            {korean && row ? HEADING : "Review disclosure"}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
