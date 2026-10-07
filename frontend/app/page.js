
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading LexMind...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>LexMind</h1>

      <p>Intelligence that remembers the case.</p>

      <div style={{ marginTop: "30px" }}>
        <p>
          Signed in as: <strong>{user.email}</strong>
        </p>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "15px",
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </main>
  );
}

