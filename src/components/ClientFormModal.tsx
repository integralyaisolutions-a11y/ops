"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";
import type { Client } from "@/lib/database.types";

export function ClientFormModal({
  client,
  onClose,
  onSaved,
}: {
  client?: Client;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const [name, setName] = useState(client?.name || "");
  const [contactName, setContactName] = useState(client?.contact_name || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [email, setEmail] = useState(client?.email || "");
  const [notes, setNotes] = useState(client?.notes || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast("Ponle un nombre al cliente");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: name.trim(),
      contact_name: contactName,
      phone,
      email,
      notes,
    };
    if (client) {
      const { error } = await supabase.from("clients").update(payload).eq("id", client.id);
      setSaving(false);
      if (error) {
        toast("No se pudo guardar: " + error.message);
        return;
      }
      toast("Cliente actualizado");
      onClose();
    } else {
      const { data, error } = await supabase.from("clients").insert(payload).select().single();
      setSaving(false);
      if (error || !data) {
        toast("No se pudo crear: " + (error?.message || ""));
        return;
      }
      toast("Cliente creado");
      onClose();
      onSaved?.(data.id);
    }
  }

  return (
    <Modal
      title={client ? "Editar cliente" : "Nuevo cliente"}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <div className="field">
        <label>Nombre del cliente</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Persona de contacto</label>
          <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div className="field">
          <label>Teléfono</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Email</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>Notas</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Modal>
  );
}
