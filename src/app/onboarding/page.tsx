"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", userId);
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="center-screen">
      <div className="card center-card">
        <div className="glyph">👋</div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>¿Cómo te llamas?</h2>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>
          Así es como te verá el resto del equipo en Integraly Ops.
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
