"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import { createClient } from "../../../lib/supabase/client";

export default function NewCasePage() {
  const router = useRouter();

  const [caseNumber, setCaseNumber] = useState("");
  const [title, setTitle] = useState("");
  const [caseType, setCaseType] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

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
        case_number: caseNumber,
        title: title,
        case_type: caseType,
        description: description,
        status: status,
      });

      const response = await fetch(
        "http://127.0.0.1:8001/api/cases/?" +
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
            : "Unable to create case."
        );
      }

      router.push("/cases/" + data.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="lexmind-shell">
      <Sidebar />

      <main className="main-content">
        <div className="new-case-container">
          <button
            className="back-button"
            onClick={() => router.push("/cases")}
          >
            ← Back to cases
          </button>

          <div className="page-header new-case-header">
            <div>
              <div className="eyebrow">
                CASE MANAGEMENT
              </div>

              <h1>Create New Case</h1>

              <p>
                Start a dedicated workspace for this legal
                matter.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="case-form"
          >
            <div className="form-section">
              <div className="form-section-title">
                Case Information
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Case Number</label>

                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(event) =>
                      setCaseNumber(event.target.value)
                    }
                    placeholder="e.g. CIV-2026-001"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Case Type</label>

                  <input
                    type="text"
                    value={caseType}
                    onChange={(event) =>
                      setCaseType(event.target.value)
                    }
                    placeholder="e.g. Civil, Criminal, Corporate"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Case Title</label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Sharma v. State"
                  required
                />
              </div>

              <div className="form-field">
                <label>Description</label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Add a brief description of the case..."
                  rows={6}
                />
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => router.push("/cases")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Creating case..."
                  : "Create Case"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}