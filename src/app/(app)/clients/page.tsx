"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/app-data";
import { useProjects } from "@/lib/hooks/useProjects";
import { ClientFormModal } from "@/components/ClientFormModal";

export default function ClientsPage() {
  const { clients, isAdmin } = useAppData();
  const { projects } = useProjects();
  const [showNew, setShowNew] = useState(false);
  const router = useRouter();

  const list = Object.entries(clients);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Clientes</h1>
          <div className="topbar-sub">Fichas de cliente</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            + Nuevo cliente
          </button>
        )}
      </div>
      <div className="content">
        {list.length === 0 ? (
          <div className="empty">Todavía no hay clientes. Crea el primero con &quot;+ Nuevo cliente&quot;.</div>
        ) : (
          <div className="grid grid-cards">
            {list.map(([id, c]) => {
              const n = Object.values(projects).filter((p) => p.client_id === id).length;
              return (
                <Link key={id} href={`/clients/${id}`} className="card proj-card">
                  <div className="proj-name">{c.name}</div>
                  <div className="muted" style={{ fontSize: 12.6 }}>{c.contact_name || ""}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {n} proyecto{n === 1 ? "" : "s"}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showNew && (
        <ClientFormModal
          onClose={() => setShowNew(false)}
          onSaved={(id) => router.push(`/clients/${id}`)}
        />
      )}
    </>
  );
}
