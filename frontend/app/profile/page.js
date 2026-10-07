"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import { createClient } from "../../lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
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

    loadProfile();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="lexmind-shell">
        <Sidebar />

        <main className="main-content">
          <div className="loading-panel">
            Loading profile...
          </div>
        </main>
      </div>
    );
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Lawyer";

  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="lexmind-shell">
      <Sidebar />

      <main className="main-content profile-workspace">
        <header className="page-header">
          <div>
            <div className="eyebrow">
              ACCOUNT
            </div>

            <h1>Profile</h1>

            <p>
              Manage your LexMind account and workspace
              information.
            </p>
          </div>
        </header>

        <section className="profile-card">
          <div className="profile-identity">
            <div className="profile-avatar">
              {initials}
            </div>

            <div>
              <div className="eyebrow">
                LEXMIND ACCOUNT
              </div>

              <h2>{fullName}</h2>

              <p>{user.email}</p>
            </div>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-details">
            <div className="profile-detail">
              <span>FULL NAME</span>
              <strong>{fullName}</strong>
            </div>

            <div className="profile-detail">
              <span>EMAIL ADDRESS</span>
              <strong>{user.email}</strong>
            </div>

            <div className="profile-detail">
              <span>ACCOUNT STATUS</span>
              <strong className="profile-status">
                Active
              </strong>
            </div>

            <div className="profile-detail">
              <span>AUTHENTICATION</span>
              <strong>
                Supabase Auth
              </strong>
            </div>
          </div>
        </section>

        <section className="profile-security">
          <div>
            <div className="eyebrow">
              SECURITY
            </div>

            <h2>Account security</h2>

            <p>
              Your LexMind account uses authenticated
              sessions to protect access to your legal
              workspace and case data.
            </p>
          </div>

          <div className="security-indicator">
            <span></span>
            Authentication active
          </div>
        </section>

        <section className="profile-danger">
          <div>
            <div className="eyebrow">
              SESSION
            </div>

            <h2>Sign out</h2>

            <p>
              Sign out of this LexMind session on this
              device.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="secondary-button"
          >
            Sign out
          </button>
        </section>
      </main>
    </div>
  );
}