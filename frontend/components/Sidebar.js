"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "⌂",
    },
    {
      name: "My Cases",
      href: "/cases",
      icon: "▤",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">L</div>

        <div>
          <div className="brand-name">LexMind</div>
          <div className="brand-tagline">
            Intelligence that remembers the case.
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">WORKSPACE</div>

        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "sidebar-link sidebar-link-active"
                  : "sidebar-link"
              }
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}

        <Link
          href="/cases/new"
          className="new-case-button"
        >
          <span>+</span>
          <span>New Case</span>
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <div className="nav-label">ACCOUNT</div>

        <Link
          href="/profile"
          className={
            pathname === "/profile"
              ? "sidebar-link sidebar-link-active"
              : "sidebar-link"
          }
        >
          <span className="sidebar-icon">○</span>
          <span>Profile</span>
        </Link>

        <button
          onClick={handleLogout}
          className="sidebar-link sidebar-logout"
        >
          <span className="sidebar-icon">↪</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}