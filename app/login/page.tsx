"use client";

import Image from "next/image";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const params = useSearchParams();
  const needsSetup = params.get("setup") === "1";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const body = await response.json();

      if (!response.ok) {
        setError(body.error || "Giriş başarısız.");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <section className="login-card">
        <Image
          src="/dekan.png"
          alt="Dekan"
          width={112}
          height={112}
          className="login-logo"
          priority
        />
        <div className="eyebrow">PRIVATE CONTROL CENTER</div>
        <h1>Dekan Admin</h1>
        <p className="muted">
          Release, indirme ve GitHub proje istatistiklerini tek panelden izle.
        </p>

        {needsSetup && (
          <div className="notice warning">
            Önce <code>ADMIN_PASSWORD</code> ve <code>ADMIN_SECRET</code> ortam
            değişkenlerini ayarla.
          </div>
        )}

        <form onSubmit={submit} className="login-form">
          <label htmlFor="password">Admin şifresi</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <div className="notice error">{error}</div>}
          <button className="primary-button" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Panele gir"}
          </button>
        </form>

        <div className="login-footer">
          <span className="status-dot" />
          GitHub verileri yalnızca okunur.
        </div>
      </section>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="eyebrow">PRIVATE CONTROL CENTER</div>
        <h1>Dekan Admin</h1>
        <p className="muted">Giriş ekranı hazırlanıyor...</p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
