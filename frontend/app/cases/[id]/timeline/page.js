"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";

export default function TimelinePage() {
  const params = useParams();
  const caseId = params.id;

  return (
    <div className="lexmind-shell">
      <Sidebar />

      <main className="main-content timeline-workspace">
        <div className="timeline-header">
          <div>
            <Link
              href={"/cases/" + caseId}
              className="back-button"
            >
              ← Back to case
            </Link>

            <div className="eyebrow">
              CASE HISTORY
            </div>

            <h1>Timeline</h1>

            <p>
              Important events and developments in this
              legal matter.
            </p>
          </div>

          <button className="secondary-button">
            + Add Event
          </button>
        </div>

        <section className="timeline-card">
          <div className="timeline-intro">
            <div className="timeline-mark">T</div>

            <div>
              <div className="eyebrow">
                CASE TIMELINE
              </div>

              <h2>Case history</h2>

              <p>
                Important hearings, filings, findings,
                amendments, and other developments will
                appear here as the case evolves.
              </p>
            </div>
          </div>

          <div className="timeline-empty">
            <div className="timeline-line"></div>

            <div className="timeline-empty-content">
              <span className="timeline-dot"></span>

              <div>
                <div className="timeline-label">
                  NO EVENTS YET
                </div>

                <h3>
                  Your case timeline is ready
                </h3>

                <p>
                  Add important dates and developments
                  to build a chronological record of this
                  case.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="timeline-feature-grid">
          <div className="timeline-feature">
            <span>01</span>
            <h3>Hearings</h3>
            <p>
              Keep track of important hearing and court
              dates.
            </p>
          </div>

          <div className="timeline-feature">
            <span>02</span>
            <h3>Filings</h3>
            <p>
              Record important filings and procedural
              developments.
            </p>
          </div>

          <div className="timeline-feature">
            <span>03</span>
            <h3>Findings</h3>
            <p>
              Preserve significant findings and events
              throughout the case.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}