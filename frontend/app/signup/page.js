"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "../../lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const { error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Account created. Please check your email to confirm your account."
    );

    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 2500);
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
            CREATE YOUR WORKSPACE
          </div>

          <h1>Start with LexMind.</h1>

          <p className="auth-intro">
            Create your account and build a private
            workspace for your legal cases.
          </p>

          <form
            onSubmit={handleSignup}
            className="auth-form"
          >
            <div className="auth-field">
              <label htmlFor="fullName">
                FULL NAME
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signupEmail">
                EMAIL ADDRESS
              </label>

              <input
                id="signupEmail"
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
              <label htmlFor="signupPassword">
                PASSWORD
              </label>

              <input
                id="signupPassword"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Create a secure password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating workspace..."
                : "Create account →"}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              Already have an account?
            </span>

            <Link href="/login">
              Sign in
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
          <div className="auth-quote-mark">L</div>

          <h2>
            Every case deserves its own memory.
          </h2>

          <p>
            Keep client details, findings, amendments,
            conversations, and important developments
            connected to the case they belong to.
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