"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !userId) return;
    setErrorMsg("");
    if (password && password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error && !error.message.toLowerCase().includes("different from the old")) {
        setSaving(false);
        setErrorMsg(error.message);
        return;
      }
    }
    await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", userId);
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="center-screen">
      <div className="card center-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-integraly.png" alt="Integraly" className="theme-light-only" style={{ height: 20, width: "auto", margin: "0 auto 22px", display: "block" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-integraly-dark.png" alt="Integraly" className="theme-dark-only" style={{ height: 20, width: "auto", margin: "0 auto 22px", display: "block" }} />
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>¿Cómo te llamas?</h2>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>
          Así es como te verá el resto del equipo en Integraly Ops. Con una contraseña podrás entrar sin pedir un enlace cada vez.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ textAlign: "left" }}>
            <input
              type="text"
              required
              placeholder="Nombre y apellido"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="field" style={{ textAlign: "left" }}>
            <input
              type="password"
              placeholder="Crea una contraseña (mín. 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {saving ? "Guardando…" : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
