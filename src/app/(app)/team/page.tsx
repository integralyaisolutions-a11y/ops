"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Modal";
import { useAppData } from "@/components/app-data";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";
import { inviteTeamMember } from "./actions";
import type { Role } from "@/lib/database.types";

function AddTeamModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("developer");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!email.trim()) {
      toast("Escribe un email");
      return;
    }
    setSaving(true);
    const res = await inviteTeamMember(email.trim(), role);
    setSaving(false);
    if (res?.error) {
      toast(res.error);
      return;
    }
    toast("Invitación enviada");
    onClose();
  }

  return (
    <Modal title="Añadir persona al equipo" onClose={onClose} onSave={handleSave} saving={saving} saveLabel="Invitar">
      <div className="field">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@empresa.com"
          autoFocus
        />
      </div>
      <div className="field">
        <label>Rol</label>
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="developer">Developer — acceso solo a sus proyectos</option>
          <option value="admin">Administrador — acceso completo</option>
        </select>
      </div>
      <p className="muted" style={{ fontSize: 12.3, lineHeight: 1.5 }}>
        Le llegará un email con un enlace para entrar sin contraseña.
      </p>
    </Modal>
  );
}

export default function TeamPage() {
  const { me, team, nameFor } = useAppData();
  const [showAdd, setShowAdd] = useState(false);

  const rows = Object.entries(team).sort(([, a], [, b]) => a.role.localeCompare(b.role));

  async function setRole(id: string, role: Role) {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) {
      toast("No se pudo cambiar el rol: " + error.message);
      return;
    }
    toast("Rol actualizado");
  }

  async function removeMember(id: string) {
    if (!confirm(`¿Quitar a ${nameFor(id)} del equipo? Perderá el acceso.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      toast(error.message);
      return;
    }
    toast("Persona eliminada del equipo");
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Equipo</h1>
          <div className="topbar-sub">Personas con acceso y sus permisos</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Añadir persona
        </button>
      </div>
      <div className="content">
        <div className="card pad">
          {rows.map(([id, t]) => (
            <div className="team-row" key={id}>
              <Avatar id={id} name={nameFor(id)} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.6 }}>
                  {nameFor(id)}
                  {id === me.id && <span className="muted" style={{ fontWeight: 400 }}> (tú)</span>}
                </div>
              </div>
              <span className={`role-pill role-${t.role}`}>
                {t.role === "admin" ? "Administrador" : "Developer"}
              </span>
              <select
                value={t.role}
                onChange={(e) => setRole(id, e.target.value as Role)}
                style={{
                  padding: "5px 7px",
                  border: "1px solid var(--border)",
                  borderRadius: 7,
                  fontSize: 12.3,
                  background: "var(--surface)",
                  color: "var(--ink)",
                }}
              >
                <option value="developer">Developer</option>
                <option value="admin">Administrador</option>
              </select>
              <button className="icon-btn" title="Quitar del equipo" onClick={() => removeMember(id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {showAdd && <AddTeamModal onClose={() => setShowAdd(false)} />}
    </>
  );
}
