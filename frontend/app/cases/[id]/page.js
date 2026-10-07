"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import { createClient } from "../../../lib/supabase/client";

export default function CaseWorkspace() {
  const params = useParams();
  const router = useRouter();

  const caseId = params.id;

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCase() {
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
          "http://127.0.0.1:8001/api/cases/" + caseId,
          {
            headers: {
              Authorization:
                "Bearer " + session.access_token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Unable to load case."
          );
        }

        setCaseData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (caseId) {
      loadCase();
    }
  }, [caseId, router]);

  if (loading) {
    return (
      <div className="lexmind-shell">
        <Sidebar />

        <main className="main-content">
          <div className="loading-panel">
            Loading case workspace...
          </div>
        </main>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="lexmind-shell">
        <Sidebar />

        <main className="main-content">
          <div className="error-panel">
            {error || "Case not found."}
          </div>

          <Link
            href="/cases"
            className="text-link"
          >
            ← Back to cases
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="lexmind-shell">
      <Sidebar />

      <main className="main-content case-workspace">
        <button
          className="back-button"
          onClick={() => router.push("/cases")}
        >
          ← Back to cases
        </button>

        <header className="case-workspace-header">
          <div>
            <div className="case-number-large">
              {caseData.case_number}
            </div>

            <h1>{caseData.title}</h1>

            <div className="case-meta">
              <span>
                {caseData.case_type || "General"}
              </span>

              <span className="meta-divider">•</span>

              <span
                className={
                  caseData.status === "active"
                    ? "status-badge status-active"
                    : "status-badge"
                }
              >
                {caseData.status}
              </span>
            </div>
          </div>

          <div className="case-header-actions">
            <button className="secondary-button">
              Edit Case
            </button>
          </div>
        </header>

        <div className="case-navigation">
          <Link
            href={"/cases/" + caseId}
            className="case-nav-active"
          >
            Overview
          </Link>

          <Link
            href={"/cases/" + caseId + "/chat"}
          >
            AI Assistant
          </Link>

          <Link
            href={"/cases/" + caseId + "/memory"}
          >
            Memory
          </Link>

          <Link
            href={"/cases/" + caseId + "/timeline"}
          >
            Timeline
          </Link>
        </div>

        <section className="case-overview-grid">
          <div className="case-main-card">
            <div className="eyebrow">
              CASE OVERVIEW
            </div>

            <h2>About this case</h2>

            <p className="case-description">
              {caseData.description ||
                "No description has been added to this case yet."}
            </p>

            <div className="case-details">
              <div>
                <span>Case Number</span>
                <strong>{caseData.case_number}</strong>
              </div>

              <div>
                <span>Case Type</span>
                <strong>
                  {caseData.case_type || "Not specified"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {caseData.status}
                </strong>
              </div>

              <div>
                <span>Created</span>
                <strong>
                  {new Date(
                    caseData.created_at
                  ).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>

          <div className="case-memory-card">
            <div className="memory-symbol">M</div>

            <div className="eyebrow">
              CASE MEMORY
            </div>

            <h2>Persistent context</h2>

            <p>
              LexMind remembers information relevant to
              this case so your conversations stay
              grounded in its history.
            </p>

            <Link
              href={"/cases/" + caseId + "/memory"}
              className="memory-link"
            >
              Explore case memory →
            </Link>
          </div>
        </section>

        <section className="case-action-grid">
          <Link
            href={"/cases/" + caseId + "/chat"}
            className="workspace-action"
          >
            <span className="action-icon">✦</span>

            <div>
              <h3>Ask LexMind</h3>

              <p>
                Ask questions about this case and its
                remembered context.
              </p>
            </div>

            <span className="action-arrow">→</span>
          </Link>

          <Link
            href={"/cases/" + caseId + "/memory"}
            className="workspace-action"
          >
            <span className="action-icon">M</span>

            <div>
              <h3>Case Memory</h3>

              <p>
                Search and add important information
                to this case's memory.
              </p>
            </div>

            <span className="action-arrow">→</span>
          </Link>

          <Link
            href={"/cases/" + caseId + "/timeline"}
            className="workspace-action"
          >
            <span className="action-icon">◷</span>

            <div>
              <h3>Case Timeline</h3>

              <p>
                View important events and developments
                as the case evolves.
              </p>
            </div>

            <span className="action-arrow">→</span>
          </Link>
        </section>
      </main>
    </div>
  );
}