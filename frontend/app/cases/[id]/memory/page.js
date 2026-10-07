"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import { createClient } from "../../../../lib/supabase/client";

export default function MemoryPage() {
  const params = useParams();
  const router = useRouter();

  const caseId = params.id;

  const [caseData, setCaseData] = useState(null);
  const [query, setQuery] = useState("");
  const [memory, setMemory] = useState("");
  const [memories, setMemories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  async function handleSearch(event) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery || searching) {
      return;
    }

    setSearching(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const params = new URLSearchParams({
        query: trimmedQuery,
      });

      const response = await fetch(
        "http://127.0.0.1:8001/api/memory/" +
          caseId +
          "?" +
          params.toString(),
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
            : "Unable to search case memory."
        );
      }

      setMemories(data.memories || []);

      if (!data.memories || data.memories.length === 0) {
        setMessage("No matching memories were found.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleAddMemory(event) {
    event.preventDefault();

    const trimmedMemory = memory.trim();

    if (!trimmedMemory || saving) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const params = new URLSearchParams({
        memory: trimmedMemory,
      });

      const response = await fetch(
        "http://127.0.0.1:8001/api/memory/" +
          caseId +
          "?" +
          params.toString(),
        {
          method: "POST",
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
            : "Unable to save memory."
        );
      }

      setMemory("");
      setMessage(
        "Memory saved to this case successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="lexmind-shell">
        <Sidebar />

        <main className="main-content">
          <div className="loading-panel">
            Loading case memory...
          </div>
        </main>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div className="lexmind-shell">
        <Sidebar />

        <main className="main-content">
          <div className="error-panel">
            {error}
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

      <main className="main-content memory-workspace">
        <div className="memory-header">
          <div>
            <Link
              href={"/cases/" + caseId}
              className="back-button"
            >
              ← {caseData.case_number}
            </Link>

            <div className="eyebrow">
              CASE MEMORY
            </div>

            <h1>Memory</h1>

            <p>
              Everything LexMind remembers about{" "}
              <strong>{caseData.title}</strong>.
            </p>
          </div>

          <div className="memory-header-mark">
            M
          </div>
        </div>

        <div className="memory-layout">
          <section className="memory-search-section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  RETRIEVE CONTEXT
                </div>

                <h2>Search case memory</h2>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="memory-search-form"
            >
              <input
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search what LexMind remembers about this case..."
              />

              <button
                type="submit"
                className="primary-button"
                disabled={
                  searching || !query.trim()
                }
              >
                {searching
                  ? "Searching..."
                  : "Search Memory"}
              </button>
            </form>

            {message && (
              <div className="memory-success">
                {message}
              </div>
            )}

            {error && (
              <div className="error-panel">
                {error}
              </div>
            )}

            <div className="memory-results">
              {memories.length > 0 ? (
                memories.map((item, index) => (
                  <div
                    key={index}
                    className="memory-result"
                  >
                    <div className="memory-result-label">
                      MEMORY {index + 1}
                    </div>

                    <div className="memory-result-content">
                      {typeof item === "string"
                        ? item
                        : JSON.stringify(
                            item,
                            null,
                            2
                          )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="memory-empty">
                  <div className="memory-empty-mark">
                    M
                  </div>

                  <h3>
                    Search this case's memory
                  </h3>

                  <p>
                    Ask about a client detail, finding,
                    amendment, event, or any other
                    information LexMind may have retained.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="add-memory-card">
            <div className="eyebrow">
              ADD KNOWLEDGE
            </div>

            <h2>Remember something</h2>

            <p>
              Add an important fact, finding, client
              detail, amendment, or other case-specific
              information to long-term memory.
            </p>

            <form
              onSubmit={handleAddMemory}
              className="add-memory-form"
            >
              <textarea
                value={memory}
                onChange={(event) =>
                  setMemory(event.target.value)
                }
                placeholder="Example: The next hearing is scheduled for 14 October 2026..."
                rows={8}
              />

              <button
                type="submit"
                className="primary-button"
                disabled={
                  saving || !memory.trim()
                }
              >
                {saving
                  ? "Saving..."
                  : "Save to Case Memory"}
              </button>
            </form>

            <div className="memory-note">
              <span>✦</span>
              This information belongs to this case's
              memory and will be available when LexMind
              recalls relevant context.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}