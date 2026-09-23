"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(
        error.message.includes("Signups not allowed")
          ? "Esta cuenta no ha sido invitada todavía. Pide a un administrador que te añada desde Equipo."
          : "No se pudo enviar el enlace. Inténtalo de nuevo.",
      );
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="center-screen">
      <div className="card center-card">
        <div className="glyph">⚙️</div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Integraly Ops</h2>
        {status === "sent" ? (
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Te hemos enviado un enlace de acceso a <b>{email}</b>. Ábrelo desde este mismo
            dispositivo para entrar.
          </p>
        ) : (
          <>
            <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>
              Introduce tu email de trabajo y te enviaremos un enlace para entrar, sin
              contraseña.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="field" style={{ textAlign: "left" }}>
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              {status === "error" && (
                <p style={{ color: "var(--danger)", fontSize: 12.6, marginBottom: 12 }}>
                  {errorMsg}
                </p>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === "sending"}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {status === "sending" ? "Enviando…" : "Enviar enlace de acceso"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
