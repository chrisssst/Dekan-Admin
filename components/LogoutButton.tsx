"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button className="ghost-button" onClick={logout}>
      Çıkış yap
    </button>
  );
}
