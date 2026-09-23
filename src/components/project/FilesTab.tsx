"use client";

import { useRef, useState } from "react";
import { useAppData } from "@/components/app-data";
import { useFiles } from "@/lib/hooks/useProjectDetail";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";
import { fileGlyph, fmtDate, fmtSize } from "@/lib/format";
import type { Project } from "@/lib/database.types";

const BUCKET = "project-files";

export function FilesTab({ project }: { project: Project }) {
  const { me, isAdmin, nameFor } = useAppData();
  const { rows: files, loading } = useFiles(project.id);
  const [uploading, setUploading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = Object.values(files).sort((a, b) =>
    (b.uploaded_at || "").localeCompare(a.uploaded_at || ""),
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${project.id}/${crypto.randomUUID()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
    if (upErr) {
      setUploading(false);
      toast("No se pudo subir el archivo: " + upErr.message);
      return;
    }
    const { error: insErr } = await supabase.from("files").insert({
      project_id: project.id,
      storage_path: path,
      filename: file.name,
      content_type: file.type || null,
      size_bytes: file.size,
      uploaded_by: me.id,
    });
    setUploading(false);
    if (insErr) {
      toast("Archivo subido, pero no se pudo registrar: " + insErr.message);
      return;
    }
    toast("Archivo subido");
  }

  async function openFile(fileId: string, storagePath: string) {
    setOpeningId(fileId);
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60);
    setOpeningId(null);
    if (error || !data) {
      toast("No se pudo abrir el archivo");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function deleteFile(fileId: string, storagePath: string) {
    if (!confirm("¿Borrar este archivo?")) return;
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([storagePath]);
    const { error } = await supabase.from("files").delete().eq("id", fileId);
    if (error) toast("No se pudo eliminar: " + error.message);
  }

  return (
    <div className="card pad">
      <div className="row" style={{ marginBottom: 16 }}>
        <label className="btn btn-primary" style={{ cursor: "pointer" }}>
          📎 {uploading ? "Subiendo…" : "Subir archivo"}
          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {loading ? (
        <div className="empty">Cargando…</div>
      ) : list.length === 0 ? (
        <div className="empty">No hay archivos en este proyecto todavía.</div>
      ) : (
        list.map((f) => {
          const canDelete = isAdmin || f.uploaded_by === me.id;
          return (
            <div className="file-row" key={f.id}>
              <div className="file-icon">{fileGlyph(f.content_type)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="file-name">{f.filename}</div>
                <div className="file-meta">
                  {fmtSize(f.size_bytes)} · subido por {nameFor(f.uploaded_by)} ·{" "}
                  {fmtDate(f.uploaded_at)}
                </div>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => openFile(f.id, f.storage_path)}
                disabled={openingId === f.id}
              >
                {openingId === f.id ? "Abriendo…" : "Abrir"}
              </button>
              {canDelete && (
                <button
                  className="icon-btn"
                  title="Eliminar"
                  onClick={() => deleteFile(f.id, f.storage_path)}
                >
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
