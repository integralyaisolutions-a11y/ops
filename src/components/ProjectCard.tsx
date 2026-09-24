"use client";

import Link from "next/link";
import { useAppData } from "@/components/app-data";
import { statusLabel } from "@/lib/format";
import type { Project } from "@/lib/database.types";

export function ProjectCard({ project }: { project: Project }) {
  const { clients, nameFor } = useAppData();
  const client = project.client_id ? clients[project.client_id] : null;

  return (
    <Link href={`/projects/${project.id}`} className="card proj-card">
      <div className="proj-top">
        <div>
          <div className="proj-name">{project.name}</div>
          {client ? (
            <div className="proj-client">{client.name}</div>
          ) : project.client_id ? (
            <div className="proj-client">Cliente</div>
          ) : null}
        </div>
        <span className={`badge badge-${project.status}`}>
          <span className="badge-dot" />
          {statusLabel(project.status)}
        </span>
      </div>
      {project.next_step ? (
        <div className="next-step">
          <b>Próximo paso · </b>
          {project.next_step}
        </div>
      ) : (
        <div className="next-step muted">Sin próximo paso definido</div>
      )}
      <div className="proj-foot">
        <span className="muted" style={{ fontSize: 11.8 }}>
          Encargado: {nameFor(project.owner_id)}
        </span>
      </div>
    </Link>
  );
}
