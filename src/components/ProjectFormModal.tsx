"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/Avatar";
import { useAppData } from "@/components/app-data";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";
import type { Project, ProjectStatus } from "@/lib/database.types";

export function ProjectFormModal({
  project,
  onClose,
  onSaved,
}: {
  project?: Project;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const { team, clients, nameFor } = useAppData();
  const [name, setName] = useState(project?.name || "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status || "activo");
  const [clientId, setClientId] = useState(project?.client_id || "");
  const [ownerId, setOwnerId] = useState(project?.owner_id || "");
  const [devIds, setDevIds] = useState<string[]>(project?.developer_ids || []);
  const [nextStep, setNextStep] = useState(project?.next_step || "");
  const [description, setDescription] = useState(project?.description || "");
  const [saving, setSaving] = useState(false);

  const admins = Object.entries(team).filter(([, t]) => t.role === "admin");
  const devs = Object.entries(team).filter(([, t]) => t.role === "developer");
  const ownerOptions = [...admins, ...devs];

  async function handleSave() {
    if (!name.trim()) {
      toast("Ponle un nombre al proyecto");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: name.trim(),
      status,
      client_id: clientId || null,
      owner_id: ownerId || null,
      developer_ids: devIds,
      next_step: nextStep,
      description,
    };
    if (project) {
      const { error } = await supabase.from("projects").update(payload).eq("id", project.id);
      setSaving(false);
      if (error) {
        toast("No se pudo guardar: " + error.message);
        return;
      }
      toast("Proyecto actualizado");
      onClose();
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...payload, created_by: user?.id })
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast("No se pudo crear: " + (error?.message || ""));
        return;
      }
      toast("Proyecto creado");
      onClose();
      onSaved?.(data.id);
    }
  }

  return (
    <Modal
      title={project ? "Editar proyecto" : "Nuevo proyecto"}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <div className="field">
        <label>Nombre del proyecto</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Automatización de pedidos"
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
        <div className="field">
          <label>Cliente</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Sin cliente</option>
            {Object.entries(clients).map(([id, c]) => (
              <option key={id} value={id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Encargado</label>
        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
          <option value="">Sin encargado</option>
          {ownerOptions.map(([id]) => (
            <option key={id} value={id}>
              {nameFor(id)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Developers asignados</label>
        <div className="chip-pick">
          {devIds.map((id) => (
            <span className="chip" key={id}>
              <Avatar id={id} name={nameFor(id)} size={18} />
              {nameFor(id)}
              <button type="button" onClick={() => setDevIds(devIds.filter((x) => x !== id))}>
                ✕
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {devs
            .filter(([id]) => !devIds.includes(id))
            .map(([id]) => (
              <button
                key={id}
                type="button"
                className="pick-opt"
                onClick={() => setDevIds([...devIds, id])}
              >
                + {nameFor(id)}
              </button>
            ))}
          {devs.length === devIds.length && (
            <span className="muted" style={{ fontSize: 12 }}>
              No hay más developers en el equipo
            </span>
          )}
        </div>
      </div>
      <div className="field">
        <label>Próximo paso</label>
        <textarea
          rows={2}
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          placeholder="Qué toca hacer ahora"
        />
      </div>
      <div className="field">
        <label>Descripción (opcional)</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
    </Modal>
  );
}
