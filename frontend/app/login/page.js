"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <div className="auth-brand">
          <div className="auth-brand-mark">L</div>

          <div>
            <div className="auth-brand-name">
              LexMind
            </div>

            <div className="auth-brand-tagline">
              Intelligence that remembers the case.
            </div>
          </div>
        </div>

        <div className="auth-content">
          <div className="eyebrow">
            LEGAL INTELLIGENCE WORKSPACE
          </div>

          <h1>Welcome back.</h1>

          <p className="auth-intro">
            Sign in to continue working with your cases,
            conversations, and case memory.
          </p>

          <form
            onSubmit={handleLogin}
            className="auth-form"
          >
            <div className="auth-field">
              <label htmlFor="email">
                EMAIL ADDRESS
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">
                PASSWORD
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in →"}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              Don't have a LexMind account?
            </span>

            <Link href="/signup">
              Create an account
            </Link>
          </div>
        </div>

        <div className="auth-bottom">
          <span>LEXMIND</span>
          <span>PRIVATE LEGAL WORKSPACE</span>
        </div>
      </div>

      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-quote-mark">“</div>

          <h2>
            The case should never have to be
            explained twice.
          </h2>

          <p>
            LexMind keeps the context of every case
            close at hand, so legal professionals can
            spend less time reconstructing history and
            more time working on the matter itself.
          </p>

          <div className="auth-visual-line"></div>

          <span>
            CASE-CENTRIC INTELLIGENCE
          </span>
        </div>
      </div>
    </main>
  );
}