"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setErrorMsg(
        error.message.toLowerCase().includes("different from the old")
          ? "La nueva contraseña tiene que ser distinta de la anterior."
          : error.message,
      );
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="center-screen">
      <div className="card center-card">
        <div className="glyph">🔑</div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Tu contraseña</h2>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>
          Crea o cambia tu contraseña para entrar sin tener que pedir un enlace cada vez.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ textAlign: "left" }}>
            <input
              type="password"
              required
              placeholder="Nueva contraseña (mín. 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
            />
          </div>
          <div className="field" style={{ textAlign: "left" }}>
            <input
              type="password"
              required
              placeholder="Repite la contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {errorMsg && (
            <p style={{ color: "var(--danger)", fontSize: 12.6, marginBottom: 12, textAlign: "left" }}>
              {errorMsg}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {saving ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => router.replace("/dashboard")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginTop: 16,
            cursor: "pointer",
            color: "var(--ink-faint)",
            fontSize: 12.8,
          }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
