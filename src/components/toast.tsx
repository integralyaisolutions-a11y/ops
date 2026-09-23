"use client";

import { useEffect, useState } from "react";

const EVENT = "integraly-toast";

export function toast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function onToast(e: Event) {
      setMsg((e as CustomEvent).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 2600);
    }
    window.addEventListener(EVENT, onToast);
    return () => {
      window.removeEventListener(EVENT, onToast);
      clearTimeout(timer);
    };
  }, []);

  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}
