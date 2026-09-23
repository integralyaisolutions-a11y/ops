"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/Avatar";
import { AppDataProvider, useAppData } from "@/components/app-data";
import { Toaster } from "@/components/toast";

function NavItem({
  href,
  icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link href={href} className={"nav-item" + (active ? " active" : "")} onClick={onNavigate}>
      <span className="nav-icon">{icon}</span>
      {label}
    </Link>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { me, isAdmin } = useAppData();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div className={"sidebar" + (open ? " open" : "")}>
        <div className="brand">
          <div className="brand-mark">IA</div>
          <div>
            <div className="brand-name">Integraly</div>
            <div className="brand-sub">Ops</div>
          </div>
        </div>
        <div className="nav-section">General</div>
        <NavItem href="/dashboard" icon="🏠" label="Inicio" onNavigate={() => setOpen(false)} />
        <NavItem href="/projects" icon="📁" label="Proyectos" onNavigate={() => setOpen(false)} />
        {isAdmin && (
          <>
            <div className="nav-section">Administración</div>
            <NavItem href="/clients" icon="🧾" label="Clientes" onNavigate={() => setOpen(false)} />
            <NavItem href="/team" icon="👥" label="Equipo" onNavigate={() => setOpen(false)} />
          </>
        )}
        <div className="sidebar-foot">
          <div className="me-row">
            <Avatar id={me.id} name={me.full_name} size={30} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="me-name">{me.full_name || "Tú"}</div>
              <div className="me-role">{isAdmin ? "Administrador" : "Developer"}</div>
            </div>
            <button
              className="icon-btn"
              title="Cerrar sesión"
              onClick={handleSignOut}
              style={{ color: "var(--sidebar-ink-dim)" }}
            >
              ⏻
            </button>
          </div>
        </div>
      </div>
      <div className="main">
        <button
          className="mobile-menu-btn"
          style={{ position: "fixed", top: 14, left: 14, zIndex: 45 }}
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>
        {children}
      </div>
      <Toaster />
    </div>
  );
}

export default function AppShell({
  me,
  children,
}: {
  me: { id: string; email: string; full_name: string | null; role: "admin" | "developer" };
  children: React.ReactNode;
}) {
  return (
    <AppDataProvider me={me}>
      <ShellInner>{children}</ShellInner>
    </AppDataProvider>
  );
}
