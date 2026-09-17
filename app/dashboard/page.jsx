import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { listMine } from "@/lib/disclosures";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard · TrustLabel" };

/**
 * Server-rendered so the list is on screen in the first paint — a spinner on a
 * projector reads as broken. The interactive half is components/Dashboard.jsx.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: session, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !session?.user) redirect("/login");

  const { data: rows, error } = await listMine(supabase);

  // Built here rather than from window.location so the URL is identical in the
  // server HTML and after hydration.
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const proto =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");

  return (
    <Dashboard
      rows={rows ?? []}
      email={session.user.email}
      origin={`${proto}://${host}`}
      loadError={error?.message ?? ""}
    />
  );
}
