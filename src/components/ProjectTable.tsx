"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { useAppData } from "@/components/app-data";
import { fmtDate, statusLabel } from "@/lib/format";
import type { Project } from "@/lib/database.types";

export function ProjectTable({
  groups,
  pendingTasks,
}: {
  groups: { key: string; label: string; projects: Project[] }[];
  pendingTasks: Record<string, number>;
}) {
  const { clients, nameFor } = useAppData();
  const router = useRouter();

  return (
    <div className="card table-card">
      <table className="ptable">
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Fase</th>
            <th className="col-next">Próximo paso</th>
            <th className="col-owner">Encargado</th>
            <th className="col-num">Pendientes</th>
            <th className="col-date">Actualizado</th>
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.key}>
            <tr className="ptable-group">
              <td colSpan={6}>
                {g.label} <span>{g.projects.length}</span>
              </td>
            </tr>
            {g.projects.map((p) => {
              const client = p.client_id ? clients[p.client_id] : null;
              const pending = pendingTasks[p.id] || 0;
              return (
                <tr key={p.id} className="ptable-row" onClick={() => router.push(`/projects/${p.id}`)}>
                  <td>
                    <Link href={`/projects/${p.id}`} className="ptable-name" onClick={(e) => e.stopPropagation()}>
                      {p.name}
                    </Link>
                    <div className="ptable-sub">{client ? client.name : "Sin cliente"}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${p.status}`}>
                      <span className="badge-dot" />
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="col-next">
                    {p.next_step ? (
                      <div className="ptable-next" title={p.next_step}>
                        {p.next_step}
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="col-owner">
                    {p.owner_id ? (
                      <div className="row" style={{ gap: 7 }}>
                        <Avatar id={p.owner_id} name={nameFor(p.owner_id)} size={22} />
                        <span className="ptable-owner">{nameFor(p.owner_id)}</span>
                      </div>
                    ) : (
                      <span className="muted">Sin asignar</span>
                    )}
                  </td>
                  <td className="col-num">
                    {pending ? <span className="ptable-count">{pending}</span> : <span className="muted">—</span>}
                  </td>
                  <td className="col-date muted">{fmtDate(p.updated_at)}</td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}
