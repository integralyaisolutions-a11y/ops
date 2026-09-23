"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/app-data";
import { useProjects } from "@/lib/hooks/useProjects";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import type { ProjectStatus } from "@/lib/database.types";

const GROUPS: [ProjectStatus, string][] = [
  ["activo", "Activos"],
  ["pausado", "Pausados"],
  ["cerrado", "Cerrados"],
];

export default function ProjectsPage() {
  const { isAdmin } = useAppData();
  const { projects, loading } = useProjects();
  const [showNew, setShowNew] = useState(false);
  const router = useRouter();
  const all = Object.values(projects);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Proyectos</h1>
          <div className="topbar-sub">Todos los proyectos que puedes ver</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            + Nuevo proyecto
          </button>
        )}
      </div>
      <div className="content">
        {loading ? (
          <div className="empty">Cargando…</div>
        ) : all.length === 0 ? (
          <div className="empty">
            {isAdmin
              ? 'Todavía no hay proyectos. Crea el primero con "+ Nuevo proyecto".'
              : "No tienes proyectos asignados todavía."}
          </div>
        ) : (
          GROUPS.map(([status, label]) => {
            const ps = all.filter((p) => p.status === status);
            if (!ps.length) return null;
            return (
              <div key={status}>
                <div className="section-title">
                  {label} ({ps.length})
                </div>
                <div className="grid grid-cards">
                  {ps.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showNew && (
        <ProjectFormModal
          onClose={() => setShowNew(false)}
          onSaved={(id) => router.push(`/projects/${id}`)}
        />
      )}
    </>
  );
}
