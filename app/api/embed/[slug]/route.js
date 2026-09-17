import { noopScript, renderScript } from "@/lib/embed";
import { getBySlug } from "@/lib/disclosures";
import { HEADING } from "@/lib/generate";
import { createClient } from "@/lib/supabase/server";

const JS = "application/javascript; charset=utf-8";

function script(body, cacheControl) {
  return new Response(body, {
    // Always 200. A non-2xx response is never executed by <script src>, so a
    // 404 here would fire an error event and render nothing, with no clue why.
    status: 200,
    headers: {
      "content-type": JS,
      "access-control-allow-origin": "*",
      "cache-control": cacheControl,
    },
  });
}

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const supabase = await createClient();
    const { data } = await getBySlug(supabase, slug);

    if (!data?.published) {
      // Deliberately uncached. Cache a miss for a minute and publishing appears
      // not to work for a minute — which is a terrible thing to discover live.
      return script(noopScript("No published disclosure for this embed."), "no-store");
    }

    return script(
      renderScript({ heading: HEADING, lines: data.lines_json ?? [] }),
      "public, s-maxage=60, stale-while-revalidate=86400"
    );
  } catch {
    return script(noopScript("The disclosure could not be loaded."), "no-store");
  }
}
