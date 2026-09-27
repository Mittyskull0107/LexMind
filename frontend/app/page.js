"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const response = await fetch("http://localhost:8000/api/health");

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data = await response.json();
        setBackendStatus(data.status || "Backend unavailable");
      } catch {
        setBackendStatus("Backend unavailable");
      }
    }

    checkBackendHealth();
  }, []);

  return (
    <main
      data-testid="lexmind-homepage"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h1 data-testid="lexmind-title">LexMind</h1>

      <p data-testid="lexmind-description">
        AI-powered legal case memory assistant
      </p>

      <p data-testid="backend-status">
        Backend status: {backendStatus}
      </p>
    </main>
  );
}