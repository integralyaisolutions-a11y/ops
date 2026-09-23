"use client";

export function Modal({
  title,
  onClose,
  onSave,
  saveLabel = "Guardar",
  children,
  saving,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
  children: React.ReactNode;
  saving?: boolean;
}) {
  return (
    <div
      className="modal-back"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h3 style={{ fontSize: 16 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? "Guardando…" : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
