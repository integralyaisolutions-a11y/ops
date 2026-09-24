"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useAppData } from "@/components/app-data";
import { useTasks } from "@/lib/hooks/useProjectDetail";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";
import type { Project } from "@/lib/database.types";

export function TasksTab({ project }: { project: Project }) {
  const { me, isStaff, nameFor } = useAppData();
  const { rows: tasks, loading } = useTasks(project.id);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [adding, setAdding] = useState(false);

  const assignable = [project.owner_id, ...(project.developer_ids || [])].filter(
    (v, i, arr): v is string => !!v && arr.indexOf(v) === i,
  );

  const list = Object.values(tasks).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (b.created_at || "").localeCompare(a.created_at || "");
  });

  async function addTask() {
    if (!title.trim()) return;
    setAdding(true);
    const supabase = createClient();
    const { error } = await supabase.from("tasks").insert({
      project_id: project.id,
      title: title.trim(),
      assignee_id: assignee || null,
      created_by: me.id,
    });
    setAdding(false);
    if (error) {
      toast("No se pudo añadir la tarea: " + error.message);
      return;
    }
    setTitle("");
  }

  async function toggleTask(taskId: string, done: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ done: !done, done_at: !done ? new Date().toISOString() : null })
      .eq("id", taskId);
    if (error) toast("No se pudo actualizar: " + error.message);
  }

  async function assignTask(taskId: string, assigneeId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ assignee_id: assigneeId || null })
      .eq("id", taskId);
    if (error) toast("No se pudo asignar: " + error.message);
  }

  async function deleteTask(taskId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) toast("No se pudo eliminar: " + error.message);
  }

  return (
    <div className="card pad">
      <div className="row" style={{ gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Nueva tarea…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          style={{
            flex: 1,
            padding: "9px 11px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--surface)",
            color: "var(--ink)",
            fontSize: 13.6,
          }}
        />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          style={{
            padding: "9px 8px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--surface)",
            color: "var(--ink)",
            fontSize: 13,
            maxWidth: 150,
          }}
        >
          <option value="">Sin asignar</option>
          {assignable.map((a) => (
            <option key={a} value={a}>
              {nameFor(a)}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={addTask} disabled={adding}>
          Añadir
        </button>
      </div>

      {loading ? (
        <div className="empty">Cargando…</div>
      ) : list.length === 0 ? (
        <div className="empty">No hay tareas todavía.</div>
      ) : (
        list.map((t) => {
          const canToggle = isStaff || t.assignee_id === me.id;
          const canDelete = isStaff || t.created_by === me.id;
          // Igual que la política RLS de tasks: staff, asignado o creador
          const canAssign = isStaff || t.assignee_id === me.id || t.created_by === me.id;
          // Incluye al asignado actual aunque ya no esté en el proyecto
          const options =
            t.assignee_id && !assignable.includes(t.assignee_id)
              ? [t.assignee_id, ...assignable]
              : assignable;
          return (
            <div className="task-row" key={t.id}>
              <button
                className={"task-check" + (t.done ? " done" : "")}
                disabled={!canToggle}
                onClick={() => toggleTask(t.id, t.done)}
              >
                {t.done ? "✓" : ""}
              </button>
              <div className={"task-title" + (t.done ? " done" : "")}>{t.title}</div>
              {canAssign ? (
                <div className="task-assignee">
                  {t.assignee_id && <Avatar id={t.assignee_id} name={nameFor(t.assignee_id)} size={19} />}
                  <select
                    className="task-assign-select"
                    value={t.assignee_id || ""}
                    onChange={(e) => assignTask(t.id, e.target.value)}
                    title="Asignar a…"
                  >
                    <option value="">Sin asignar</option>
                    {options.map((a) => (
                      <option key={a} value={a}>
                        {nameFor(a)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : t.assignee_id ? (
                <div className="task-assignee">
                  <Avatar id={t.assignee_id} name={nameFor(t.assignee_id)} size={19} />
                  {nameFor(t.assignee_id)}
                </div>
              ) : (
                <div className="task-assignee muted">Sin asignar</div>
              )}
              {canDelete && (
                <button className="icon-btn" title="Eliminar" onClick={() => deleteTask(t.id)}>
                  ✕
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
