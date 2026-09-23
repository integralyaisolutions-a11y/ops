"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppData } from "@/components/app-data";
import { useProjects } from "@/lib/hooks/useProjects";
import { ClientFormModal } from "@/components/ClientFormModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";
import { statusLabel } from "@/lib/format";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = params.id;
  const { clients, isAdmin } = useAppData();
  const { projects } = useProjects();
  const [showEdit, setShowEdit] = useState(false);
  const router = useRouter();

  const client = clients[clientId];
  const clientProjects = Object.entries(projects).filter(([, p]) => p.client_id === clientId);

  async function handleDelete() {
    if (clientProjects.length) {
      toast("No se puede borrar: hay proyectos con este cliente");
      return;
    }
    if (!confirm("¿Borrar este cliente?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("clients").delete().eq("id", clientId);
    if (error) {
      toast("No se pudo borrar: " + error.message);
      return;
    }
    router.push("/clients");
  }

  if (!client) {
    return (
      <div className="content">
        <div className="empty">Cliente no encontrado.</div>
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>{client.name}</h1>
        </div>
      </div>
      <div className="content">
        <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr", alignItems: "start" }}>
          <div className="card pad">
            <div className="row between" style={{ marginBottom: 10 }}>
              <h3 style={{ fontSize: 15 }}>Ficha</h3>
              {isAdmin && (
                <div className="row">
                  <button className="btn btn-sm" onClick={() => setShowEdit(true)}>
                    Editar
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={handleDelete}>
                    Borrar
                  </button>
                </div>
              )}
            </div>
            <div className="section-title" style={{ marginTop: 0 }}>
              Contacto
            </div>
            <div style={{ fontSize: 13.5 }}>{client.contact_name || "—"}</div>
            <div className="section-title">Email</div>
            <div style={{ fontSize: 13.5 }}>{client.email || "—"}</div>
            <div className="section-title">Teléfono</div>
            <div style={{ fontSize: 13.5 }}>{client.phone || "—"}</div>
            {client.notes && (
              <>
                <div className="section-title">Notas</div>
                <div style={{ fontSize: 13.4, whiteSpace: "pre-wrap", color: "var(--ink-soft)" }}>
                  {client.notes}
                </div>
              </>
            )}
          </div>
          <div className="card pad">
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Proyectos ({clientProjects.length})</h3>
            {clientProjects.length ? (
              clientProjects.map(([pid, p]) => (
                <div
                  key={pid}
                  className="row between"
                  style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }}
                >
                  <Link href={`/projects/${pid}`} style={{ fontWeight: 600, fontSize: 13.5 }}>
                    {p.name}
                  </Link>
                  <span className={`badge badge-${p.status}`}>{statusLabel(p.status)}</span>
                </div>
              ))
            ) : (
              <div className="empty">Sin proyectos todavía.</div>
            )}
          </div>
        </div>
      </div>

      {showEdit && <ClientFormModal client={client} onClose={() => setShowEdit(false)} />}
    </>
  );
}
