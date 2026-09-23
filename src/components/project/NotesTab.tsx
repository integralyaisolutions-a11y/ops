"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useAppData } from "@/components/app-data";
import { useNotes } from "@/lib/hooks/useProjectDetail";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";
import { fmtDateTime } from "@/lib/format";
import type { Project } from "@/lib/database.types";

export function NotesTab({ project }: { project: Project }) {
  const { me, nameFor } = useAppData();
  const { rows: notes, loading } = useNotes(project.id);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const list = Object.values(notes).sort((a, b) =>
    (a.created_at || "").localeCompare(b.created_at || ""),
  );

  async function post() {
    if (!text.trim()) return;
    setPosting(true);
    const supabase = createClient();
    const { error } = await supabase.from("notes").insert({
      project_id: project.id,
      author_id: me.id,
      text: text.trim(),
    });
    setPosting(false);
    if (error) {
      toast("No se pudo publicar: " + error.message);
      return;
    }
    setText("");
  }

  return (
    <div className="card pad">
      {loading ? (
        <div className="empty">Cargando…</div>
      ) : list.length === 0 ? (
        <div className="empty">Todavía no hay notas. Escribe la primera abajo.</div>
      ) : (
        list.map((n) => (
          <div className="note" key={n.id}>
            <Avatar id={n.author_id || ""} name={nameFor(n.author_id)} size={28} />
            <div style={{ flex: 1 }}>
              <div className="note-head">
                <span className="note-author">{nameFor(n.author_id)}</span>
                <span className="note-time">{fmtDateTime(n.created_at)}</span>
              </div>
              <div className="note-text">{n.text}</div>
            </div>
          </div>
        ))
      )}
      <div className="note-compose">
        <textarea
          placeholder="Escribe una nota o comentario para el equipo…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="btn btn-primary"
          style={{ alignSelf: "flex-end" }}
          onClick={post}
          disabled={posting}
        >
          Publicar
        </button>
      </div>
    </div>
  );
}
