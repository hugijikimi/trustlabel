import { redirect } from "next/navigation";
import Wizard from "@/components/Wizard";
import { getById } from "@/lib/disclosures";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "New disclosure · TrustLabel" };

export default async function WizardPage({ searchParams }) {
  const supabase = await createClient();
  const { data: session, error } = await supabase.auth.getUser();

  // §4 route table: /wizard is auth-required.
  if (error || !session?.user) redirect("/login");

  // /wizard?id=… edits an existing disclosure. RLS keeps this to the caller's
  // own rows, so a guessed id returns nothing rather than someone else's work.
  const { id } = await searchParams;
  const initial = id ? ((await getById(supabase, id)).data ?? null) : null;

  return <Wizard initial={initial} />;
}
