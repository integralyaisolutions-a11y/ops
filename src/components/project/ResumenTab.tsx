"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { useAppData } from "@/components/app-data";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";
import { fmtDate, statusLabel } from "@/lib/format";
import type { Project } from "@/lib/database.types";

export function ResumenTab({ project }: { project: Project }) {
  const { clients, nameFor } = useAppData();
  const [nextStep, setNextStep] = useState(project.next_step || "");
  const [saving, setSaving] = useState(false);
  const client = project.client_id ? clients[project.client_id] : null;
  const devs = project.developer_ids || [];

  async function saveNextStep() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("update_next_step", {
      pid: project.id,
      val: nextStep,
    });
    setSaving(false);
    if (error) {
      toast("No se pudo guardar: " + error.message);
      return;
    }
    toast("Próximo paso actualizado");
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
      <div className="card pad">
        <div className="row between" style={{ marginBottom: 14 }}>
          <span className={`badge badge-${project.status}`}>
            <span className="badge-dot" />
            {statusLabel(project.status)}
          </span>
        </div>
        <div className="section-title" style={{ marginTop: 0 }}>
          Próximo paso
        </div>
        <div className="field">
          <textarea
            rows={2}
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            placeholder="¿Qué toca hacer ahora en este proyecto?"
          />
        </div>
        <button className="btn btn-sm" onClick={saveNextStep} disabled={saving}>
          {saving ? "Guardando…" : "Guardar próximo paso"}
        </button>
        {project.description && (
          <>
            <div className="section-title">Descripción</div>
            <div style={{ fontSize: 13.6, color: "var(--ink-soft)", whiteSpace: "pre-wrap" }}>
              {project.description}
            </div>
          </>
        )}
      </div>
      <div className="card pad">
        <div className="section-title" style={{ marginTop: 0 }}>
          Cliente
        </div>
        <div style={{ fontSize: 13.6 }}>
          {client ? (
            <Link href={`/clients/${project.client_id}`} style={{ fontWeight: 600 }}>
              {client.name}
            </Link>
          ) : (
            <span className="muted">Sin cliente asignado</span>
          )}
        </div>
        <div className="section-title">Encargado</div>
        <div className="row" style={{ fontSize: 13.4 }}>
          <Avatar id={project.owner_id || ""} name={nameFor(project.owner_id)} size={22} />
          {nameFor(project.owner_id)}
        </div>
        <div className="section-title">Developers</div>
        {devs.length ? (
          devs.map((d) => (
            <div className="row" key={d} style={{ fontSize: 13.4, marginBottom: 6 }}>
              <Avatar id={d} name={nameFor(d)} size={22} />
              {nameFor(d)}
            </div>
          ))
        ) : (
          <div className="muted" style={{ fontSize: 13 }}>
            Sin developers asignados
          </div>
        )}
        <div className="section-title">Creado</div>
        <div className="muted" style={{ fontSize: 12.8 }}>
          {fmtDate(project.created_at)}
        </div>
      </div>
    </div>
  );
}
