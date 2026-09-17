"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="rounded-lg border-[1.5px] border-neutral-300 px-5 py-2.5 text-sm disabled:opacity-50 dark:border-neutral-700"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
