export function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
}

export function fmtDateTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  );
}

export function fmtSize(bytes?: number | null) {
  const b = bytes || 0;
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

export function statusLabel(s: string) {
  return s === "activo" ? "Activo" : s === "pausado" ? "Pausado" : "Cerrado";
}

export function fileGlyph(ct?: string | null) {
  if (!ct) return "📄";
  if (ct.startsWith("image/")) return "🖼️";
  if (ct === "application/pdf") return "📕";
  if (ct.includes("sheet") || ct.includes("csv")) return "📊";
  if (ct.includes("zip")) return "🗂️";
  if (ct.startsWith("video/")) return "🎬";
  return "📄";
}

const AVATAR_COLORS = [
  "#4C46E0", "#1D8F5E", "#B9760F", "#CC4433", "#0E7490", "#7C3AED", "#BE185D", "#16803C",
];

export function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initialsFor(name?: string | null) {
  const n = (name || "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
