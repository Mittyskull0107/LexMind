"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import { createClient } from "../../lib/supabase/client";

export default function CasesPage() {
  const router = useRouter();

  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCases() {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

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

    loadCases();
  }, [router]);

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      caseItem.case_number
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      caseItem.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="lexmind-shell">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">CASE MANAGEMENT</div>

            <h1>My Cases</h1>

            <p>
              Your legal matters, organized and remembered.
            </p>
          </div>

          <Link
            href="/cases/new"
            className="primary-button"
          >
            + New Case
          </Link>
        </header>

        <div className="case-controls">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by case title or number..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="status-select"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {error && (
          <div className="error-panel">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-panel">
            Loading your cases...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="empty-panel">
            <div className="empty-mark">L</div>

            <h3>
              {cases.length === 0
                ? "No cases yet"
                : "No matching cases"}
            </h3>

            <p>
              {cases.length === 0
                ? "Create your first case to begin building its long-term memory."
                : "Try changing your search or status filter."}
            </p>

            {cases.length === 0 && (
              <Link
                href="/cases/new"
                className="primary-button"
              >
                Create a case
              </Link>
            )}
          </div>
        ) : (
          <div className="case-grid">
            {filteredCases.map((caseItem) => (
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
      </main>
    </div>
  );
}