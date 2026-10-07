"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import { createClient } from "../../lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      try {
        const response = await fetch(
          "http://127.0.0.1:8001/api/cases/",
          {
            headers: {
              Authorization: "Bearer " + session.access_token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Unable to load cases."
          );
        }

        setCases(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Lawyer";

  const activeCases = cases.filter(
    (caseItem) => caseItem.status === "active"
  );

  return (
    <div className="lexmind-shell">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <div className="eyebrow">LEGAL WORKSPACE</div>

            <h1>
              Good evening,{" "}
              <span>{fullName}</span>
            </h1>

            <p>
              Your cases, context, and legal intelligence — in one place.
            </p>
          </div>

          <Link
            href="/cases/new"
            className="primary-button"
          >
            + New Case
          </Link>
        </header>

        {error && (
          <div className="error-panel">
            {error}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">TOTAL CASES</div>
            <div className="stat-number">
              {loading ? "—" : cases.length}
            </div>
            <div className="stat-description">
              Cases in your workspace
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">ACTIVE CASES</div>
            <div className="stat-number">
              {loading ? "—" : activeCases.length}
            </div>
            <div className="stat-description">
              Currently active
            </div>
          </div>

          <div className="stat-card stat-card-accent">
            <div className="stat-label">CASE MEMORY</div>
            <div className="stat-title">
              Persistent
            </div>
            <div className="stat-description">
              Context stays with each case
            </div>
          </div>
        </section>

        <section className="cases-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">YOUR WORKSPACE</div>
              <h2>Recent Cases</h2>
            </div>

            <Link
              href="/cases"
              className="text-link"
            >
              View all cases →
            </Link>
          </div>

          {loading ? (
            <div className="loading-panel">
              Loading your cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="empty-panel">
              <div className="empty-mark">L</div>

              <h3>No cases yet</h3>

              <p>
                Create your first case to begin building
                its long-term memory.
              </p>

              <Link
                href="/cases/new"
                className="primary-button"
              >
                Create your first case
              </Link>
            </div>
          ) : (
            <div className="case-grid">
              {cases.slice(0, 6).map((caseItem) => (
                <Link
                  href={"/cases/" + caseItem.id}
                  key={caseItem.id}
                  className="case-card"
                >
                  <div className="case-card-top">
                    <span className="case-number">
                      {caseItem.case_number}
                    </span>

                    <span
                      className={
                        caseItem.status === "active"
                          ? "status-badge status-active"
                          : "status-badge"
                      }
                    >
                      {caseItem.status}
                    </span>
                  </div>

                  <h3>{caseItem.title}</h3>

                  <p>
                    {caseItem.description ||
                      "No case description provided."}
                  </p>

                  <div className="case-card-footer">
                    <span>
                      {caseItem.case_type || "General"}
                    </span>

                    <span>
                      Open case →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}