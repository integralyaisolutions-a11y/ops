"use client";

import { useState } from "react";
import { useAppData } from "@/components/app-data";
import { useProjects } from "@/lib/hooks/useProjects";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { isAdmin, team } = useAppData();
  const { projects, loading } = useProjects();
  const [showNew, setShowNew] = useState(false);
  const router = useRouter();

  const all = Object.values(projects);
  const active = all.filter((p) => p.status === "activo");
  const paused = all.filter((p) => p.status === "pausado");

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Inicio</h1>
          <div className="topbar-sub">Resumen de la actividad de la agencia</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            + Nuevo proyecto
          </button>
        )}
      </div>
      <div className="content">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", marginBottom: 8 }}>
          <div className="card pad stat">
            <b>{active.length}</b>
            <span>Proyectos activos</span>
          </div>
          <div className="card pad stat">
            <b>{paused.length}</b>
            <span>Pausados</span>
          </div>
          <div className="card pad stat">
            <b>{Object.keys(team).length}</b>
            <span>Personas en el equipo</span>
          </div>
        </div>

        <div className="section-title">{isAdmin ? "Proyectos activos" : "Tus proyectos activos"}</div>
        {loading ? (
          <div className="empty">Cargando…</div>
        ) : active.length === 0 ? (
          <div className="empty">
            {isAdmin
              ? 'Todavía no hay proyectos activos. Crea el primero con "+ Nuevo proyecto".'
              : "No tienes proyectos activos asignados ahora mismo."}
          </div>
        ) : (
          <div className="grid grid-cards">
            {active.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
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
