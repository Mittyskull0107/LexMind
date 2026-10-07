"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { createClient } from "../../../../lib/supabase/client";
export default function CaseChatPage() {
  const params = useParams();
  const caseId = params.id;

  const supabase = createClient();
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [caseData, setCaseData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingCase, setLoadingCase] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCase() {
      try {
        setLoadingCase(true);
        setError("");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("Please sign in again.");
        }

        const response = await fetch(
          `http://127.0.0.1:8001/api/cases/${caseId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load this case.");
        }

        const data = await response.json();
        setCaseData(data);
      } catch (err) {
        setError(err.message || "Unable to load this case.");
      } finally {
        setLoadingCase(false);
      }
    }

    if (caseId) {
      loadCase();
    }
  }, [caseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function sendMessage(text = message) {
    const cleanMessage = text.trim();

    if (!cleanMessage || sending) {
      return;
    }

    setError("");

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: cleanMessage,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");
    setSending(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Your session has expired.");
      }

      const response = await fetch(
        `http://127.0.0.1:8001/api/chat/${caseId}?message=${encodeURIComponent(
          cleanMessage
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail ||
            "LexMind could not process your request."
        );
      }

      const data = await response.json();

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content:
          data.answer ||
          "I couldn't generate an answer for that.",
        memories: data.memories_used,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the LexMind server."
      );
    } finally {
      setSending(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  const suggestions = [
    "Summarize this case",
    "What are the key findings?",
    "What amendments are relevant?",
    "What should I focus on next?",
  ];

  if (loadingCase) {
    return (
      <main className="lexmind-chat-page">
        <div className="chat-loading">
          <div className="chat-logo-small">L</div>
          <p>Opening case intelligence...</p>
        </div>
      </main>
    );
  }

  if (!caseData) {
    return (
      <main className="lexmind-chat-page">
        <div className="chat-error-screen">
          <h2>Unable to open this case</h2>
          <p>{error}</p>

          <Link href={`/cases/${caseId}`}>
            ← Back to case
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="lexmind-chat-page">
      {/* HEADER */}

      <header className="chat-header">
        <div className="chat-header-left">
          <Link
            href={`/cases/${caseId}`}
            className="chat-back"
          >
            ←
          </Link>

          <div className="chat-brand">
            <div className="chat-brand-mark">L</div>

            <div>
              <div className="chat-brand-name">
                LexMind
              </div>

              <div className="chat-case-name">
                {caseData.title}
              </div>
            </div>
          </div>
        </div>

        <div className="chat-header-case">
          <span className="chat-active-dot"></span>
          {caseData.case_number}
        </div>
      </header>

      {/* CHAT */}

      <section className="chat-container">
        {messages.length === 0 ? (
          /* EMPTY STATE */
          <div className="chat-empty">
            <div className="chat-logo-large">
              <span>L</span>
            </div>

            <h1>
              How can I help with
              <br />
              <em>this case?</em>
            </h1>

            <p>
              Ask LexMind about the case, its findings,
              amendments, history, or anything else
              you need to work through.
            </p>

            <div className="suggestions">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    sendMessage(suggestion)
                  }
                  disabled={sending}
                >
                  <span>{suggestion}</span>
                  <span>↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* MESSAGES */
          <div className="messages">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`message-row ${
                  item.role === "user"
                    ? "message-user"
                    : "message-assistant"
                }`}
              >
                {item.role === "assistant" && (
                  <div className="message-avatar">
                    L
                  </div>
                )}

                <div className="message-content">
                  <div className="message-name">
                    {item.role === "user"
                      ? "You"
                      : "LexMind"}
                  </div>

                  <div className="message-text">
                    {item.content}
                  </div>

                  {item.role === "assistant" && (
                    <div className="memory-indicator">
                      <span>✦</span>
                      Case memory consulted
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="message-row message-assistant">
                <div className="message-avatar">
                  L
                </div>

                <div className="message-content">
                  <div className="message-name">
                    LexMind
                  </div>

                  <div className="thinking">
                    <span></span>
                    <span></span>
                    <span></span>

                    <small>
                      Thinking about the case...
                    </small>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </section>

      {/* ERROR */}

      {error && (
        <div className="chat-error">
          <span>!</span>
          <div>{error}</div>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* COMPOSER */}

      <div className="composer-area">
        <form
          className="composer"
          onSubmit={handleSubmit}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask LexMind anything about this case..."
            rows={1}
            disabled={sending}
          />

          <div className="composer-bottom">
            <div className="composer-info">
              <span className="composer-status"></span>

              <span>
                Case context enabled
              </span>

              <span className="composer-separator">
                •
              </span>

              <span>
                Enter to send
              </span>
            </div>

            <button
              type="submit"
              className="send-button"
              disabled={
                sending || !message.trim()
              }
              aria-label="Send message"
            >
              ↑
            </button>
          </div>
        </form>

        <div className="composer-disclaimer">
          LexMind can make mistakes. Verify important
          legal information against authoritative sources.
        </div>
      </div>

      <style jsx>{`
        .lexmind-chat-page {
          min-height: 100vh;
          background: #10100e;
          color: #e5ded1;
          display: flex;
          flex-direction: column;
        }

        /* HEADER */

        .chat-header {
          height: 64px;
          flex-shrink: 0;
          border-bottom: 1px solid #292823;
          background: #11110f;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
        }

        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
        }

        .chat-back {
          width: 32px;
          height: 32px;
          border: 1px solid #302e29;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8a847a;
          text-decoration: none;
          font-size: 15px;
          transition: 0.2s ease;
        }

        .chat-back:hover {
          border-color: #80683f;
          color: #c0a16b;
        }

        .chat-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-brand-mark {
          width: 29px;
          height: 29px;
          border: 1px solid #80683f;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b99a63;
          font-family: Georgia, serif;
          font-size: 14px;
        }

        .chat-brand-name {
          font-family: Georgia, serif;
          color: #d8d0c2;
          font-size: 14px;
        }

        .chat-case-name {
          max-width: 400px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #66625a;
          font-size: 8px;
          margin-top: 2px;
        }

        .chat-header-case {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #746c5c;
          font-size: 8px;
          letter-spacing: 0.12em;
        }

        .chat-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9e8555;
        }

        /* MAIN */

        .chat-container {
          flex: 1;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          box-sizing: border-box;
          padding: 30px 28px 170px;
        }

        /* EMPTY */

        .chat-empty {
          min-height: 58vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding-top: 40px;
        }

        .chat-logo-large {
          width: 64px;
          height: 64px;
          border: 1px solid #80683f;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 25px;
          position: relative;
        }

        .chat-logo-large::before {
          content: "";
          position: absolute;
          inset: 7px;
          border: 1px dashed #413829;
        }

        .chat-logo-large span {
          position: relative;
          font-family: Georgia, serif;
          font-size: 25px;
          color: #b99a63;
        }

        .chat-empty h1 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -0.025em;
        }

        .chat-empty h1 em {
          color: #b09260;
          font-weight: 400;
        }

        .chat-empty > p {
          max-width: 470px;
          margin: 17px auto 28px;
          color: #716d65;
          font-size: 11px;
          line-height: 1.8;
        }

        .suggestions {
          width: 100%;
          max-width: 620px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .suggestions button {
          min-height: 48px;
          padding: 10px 13px;
          background: #141411;
          border: 1px solid #2e2c27;
          color: #938d82;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          font-size: 9px;
          transition: 0.2s ease;
        }

        .suggestions button:hover {
          border-color: #705b3a;
          color: #d0c7b9;
          background: #171612;
        }

        .suggestions button span:last-child {
          color: #806940;
          font-size: 13px;
        }

        /* MESSAGES */

        .messages {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 30px;
          padding-top: 25px;
        }

        .message-row {
          display: flex;
          gap: 13px;
          width: 100%;
        }

        .message-user {
          justify-content: flex-end;
        }

        .message-user .message-content {
          max-width: 70%;
        }

        .message-assistant .message-content {
          max-width: 78%;
        }

        .message-avatar {
          flex-shrink: 0;
          width: 29px;
          height: 29px;
          border: 1px solid #78613e;
          color: #ae8e5b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Georgia, serif;
          font-size: 13px;
          background: #151512;
        }

        .message-name {
          color: #716957;
          font-size: 8px;
          letter-spacing: 0.1em;
          margin-bottom: 7px;
        }

        .message-user .message-name {
          text-align: right;
        }

        .message-text {
          color: #cbc4b8;
          font-size: 12px;
          line-height: 1.85;
          white-space: pre-wrap;
        }

        .message-user .message-text {
          padding: 12px 15px;
          background: #191815;
          border: 1px solid #302e29;
          color: #d6cfc3;
        }

        .memory-indicator {
          margin-top: 11px;
          padding-top: 9px;
          border-top: 1px solid #282621;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6d6557;
          font-size: 8px;
        }

        .memory-indicator span {
          color: #9d8050;
        }

        /* THINKING */

        .thinking {
          display: flex;
          align-items: center;
          gap: 5px;
          height: 28px;
        }

        .thinking span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #a08352;
          animation: thinking 1.2s infinite ease-in-out;
        }

        .thinking span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .thinking span:nth-child(3) {
          animation-delay: 0.3s;
        }

        .thinking small {
          margin-left: 7px;
          color: #666159;
          font-size: 9px;
        }

        @keyframes thinking {
          0%,
          60%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }

          30% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        /* COMPOSER */

        .composer-area {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 14px 20px 17px;
          background: linear-gradient(
            to top,
            #10100e 72%,
            rgba(16, 16, 14, 0)
          );
          pointer-events: none;
        }

        .composer,
        .composer-disclaimer {
          pointer-events: auto;
        }

        .composer {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding: 12px 14px 10px;
          box-sizing: border-box;
          border: 1px solid #3b362d;
          background: #151512;
          transition: border-color 0.2s ease;
        }

        .composer:focus-within {
          border-color: #806840;
        }

        .composer textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 27px;
          max-height: 160px;
          resize: none;
          overflow-y: auto;
          border: 0;
          outline: 0;
          background: transparent;
          color: #ddd5c8;
          font-family: inherit;
          font-size: 12px;
          line-height: 1.6;
        }

        .composer textarea::placeholder {
          color: #595650;
        }

        .composer-bottom {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .composer-info {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #5f5b53;
          font-size: 7px;
        }

        .composer-status {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #92794e;
        }

        .composer-separator {
          color: #403e38;
        }

        .send-button {
          width: 31px;
          height: 31px;
          border: 0;
          background: #a3834f;
          color: #12110f;
          cursor: pointer;
          font-size: 16px;
          transition: 0.2s ease;
        }

        .send-button:hover:not(:disabled) {
          background: #c09d61;
        }

        .send-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .composer-disclaimer {
          max-width: 780px;
          margin: 7px auto 0;
          text-align: center;
          color: #484640;
          font-size: 7px;
        }

        /* ERROR */

        .chat-error {
          position: fixed;
          left: 50%;
          bottom: 130px;
          transform: translateX(-50%);
          width: min(600px, calc(100% - 40px));
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid #4b302b;
          background: #211816;
          color: #aa8178;
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 9px;
          z-index: 5;
        }

        .chat-error button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: #80625b;
          cursor: pointer;
          font-size: 15px;
        }

        /* LOADING / ERROR */

        .chat-loading,
        .chat-error-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .chat-logo-small {
          width: 40px;
          height: 40px;
          border: 1px solid #80683f;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ae8d58;
          font-family: Georgia, serif;
        }

        .chat-loading p,
        .chat-error-screen p {
          color: #67635b;
          font-size: 10px;
        }

        .chat-error-screen h2 {
          font-family: Georgia, serif;
          font-weight: 400;
        }

        .chat-error-screen a {
          color: #a18453;
          text-decoration: none;
          font-size: 10px;
        }

        @media (max-width: 650px) {
          .chat-header {
            padding: 0 15px;
          }

          .chat-header-case {
            display: none;
          }

          .chat-case-name {
            max-width: 220px;
          }

          .chat-container {
            padding: 20px 15px 165px;
          }

          .chat-empty {
            min-height: 55vh;
          }

          .chat-empty h1 {
            font-size: 37px;
          }

          .suggestions {
            grid-template-columns: 1fr;
          }

          .message-user .message-content,
          .message-assistant .message-content {
            max-width: 88%;
          }

          .composer-area {
            padding: 10px 10px 13px;
          }

          .composer-info {
            font-size: 6px;
          }

          .composer-disclaimer {
            font-size: 6px;
          }
        }
      `}</style>
    </main>
  );
}