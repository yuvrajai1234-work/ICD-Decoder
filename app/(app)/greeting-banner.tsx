"use client";

import { useEffect, useState } from "react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌙";
}

export function GreetingBanner({ username }: { username: string }) {
  const [greeting, setGreeting] = useState("");
  const [emoji, setEmoji] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    setEmoji(getGreetingEmoji());
  }, []);

  if (!greeting) return null;

  return (
    <div
      style={{
        padding: "16px 32px",
        background:
          "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.06))",
        borderBottom: "1px solid var(--border-primary)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <span style={{ fontSize: "1.3rem" }}>{emoji}</span>
      <span
        style={{
          fontSize: "0.95rem",
          color: "var(--text-secondary)",
          fontWeight: 400,
        }}
      >
        {greeting},{" "}
        <span
          style={{
            fontWeight: 600,
            background: "var(--gradient-purple)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {username}
        </span>
      </span>
    </div>
  );
}
