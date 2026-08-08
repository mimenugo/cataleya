"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client.js";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="btn btn-secondary" onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
}
