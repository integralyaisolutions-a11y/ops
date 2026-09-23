"use client";

import { colorForId, initialsFor } from "@/lib/format";

export function Avatar({
  id,
  name,
  size = 28,
  ring = false,
}: {
  id: string;
  name?: string | null;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      title={name || undefined}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colorForId(id || "?"),
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(10, size * 0.4),
        fontWeight: 700,
        flex: "0 0 auto",
        border: ring ? "2px solid var(--surface)" : "none",
        fontFamily: "var(--font-body)",
      }}
    >
      {initialsFor(name)}
    </div>
  );
}
