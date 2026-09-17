import { generateLines } from "@/lib/generate";
import { withUniqueSlug } from "@/lib/slug";

/**
 * Every function takes the Supabase client as its first argument rather than
 * importing one. The wizard and dashboard pass the browser client; the public
 * page and the embed are server-rendered and pass the server client. Importing
 * lib/supabase/client.js here would drag its "use client" along and lock the
 * public page out.
 */

const COLUMNS =
  "id, slug, shop_name, reviewer_scope, posting_period, uses_ai_ranking, " +
  "ai_criteria, deletion_criteria, external_sources, lines_json, published, " +
  "created_at, updated_at";

function toRow(answers = {}) {
  return {
    reviewer_scope: answers.reviewer_scope ?? null,
    posting_period: answers.posting_period ?? null,
    uses_ai_ranking: answers.uses_ai_ranking ?? null,
    ai_criteria: answers.ai_criteria ?? [],
    deletion_criteria: answers.deletion_criteria ?? null,
    external_sources: answers.external_sources ?? null,
    // Snapshotted at save time, not regenerated on read: the public page then
    // serves exactly what was approved, and a later change to the generator
    // cannot silently rewrite a disclosure someone already published.
    lines_json: generateLines(answers),
  };
}

export async function save(supabase, { id, shopName, answers }) {
  const { data: session, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !session?.user) {
    return { data: null, error: sessionError ?? new Error("Not signed in") };
  }

  const row = { ...toRow(answers), shop_name: shopName?.trim() ?? "" };

  if (id) {
    // The slug is deliberately left alone on update. It may already be sitting
    // in a stranger's page source, and reissuing it would break their embed.
    return supabase.from("disclosures").update(row).eq("id", id).select(COLUMNS).single();
  }

  return withUniqueSlug((slug) =>
    supabase
      .from("disclosures")
      .insert({ ...row, slug, owner_id: session.user.id })
      .select(COLUMNS)
      .single()
  );
}

export function publish(supabase, id) {
  return supabase
    .from("disclosures")
    .update({ published: true })
    .eq("id", id)
    .select(COLUMNS)
    .single();
}

export function unpublish(supabase, id) {
  return supabase
    .from("disclosures")
    .update({ published: false })
    .eq("id", id)
    .select(COLUMNS)
    .single();
}

/** Loads one row for editing. RLS keeps this to the caller's own rows. */
export function getById(supabase, id) {
  return supabase.from("disclosures").select(COLUMNS).eq("id", id).maybeSingle();
}

/** Named `remove` because `delete` is a reserved word. */
export function remove(supabase, id) {
  return supabase.from("disclosures").delete().eq("id", id);
}

/**
 * Filters on owner_id explicitly rather than leaning on RLS alone. RLS shows an
 * anonymous caller every PUBLISHED row, so without this filter a session-less
 * call would return other sellers' disclosures under the name "listMine". The
 * explicit predicate also matches B1's (owner_id, updated_at desc) index.
 */
export async function listMine(supabase) {
  const { data: session, error } = await supabase.auth.getUser();
  if (error || !session?.user) {
    return { data: [], error: error ?? new Error("Not signed in") };
  }

  return supabase
    .from("disclosures")
    .select(COLUMNS)
    .eq("owner_id", session.user.id)
    .order("updated_at", { ascending: false });
}

/**
 * Looks a disclosure up by slug and does NOT filter on `published` — an
 * anonymous reader is already limited to published rows by RLS, but a signed-in
 * owner can see their own draft. The public page must check `published` itself
 * and return notFound(), or it would leak the owner a preview at a public URL.
 */
export function getBySlug(supabase, slug) {
  return supabase.from("disclosures").select(COLUMNS).eq("slug", slug).maybeSingle();
}
