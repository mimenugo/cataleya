"use client";

import { useState } from "react";
import { apiFetchClient } from "../../../lib/api-client.js";

const FIELDS = [
  { key: "business_name", label: "Nombre del negocio", type: "text" },
  { key: "business_phone", label: "Teléfono de contacto", type: "text" },
  { key: "business_hours", label: "Horario", type: "text", placeholder: "Lun-Dom 8:00-22:00" },
  { key: "order_ready_message", label: "Mensaje de \"pedido listo\"", type: "textarea",
    placeholder: "¡Tu pedido {{numero}} ya está listo! Pásalo a recoger cuando gustes." }
];

export default function SettingsForm({ initialSettings, canEdit }) {
  const [values, setValues] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await apiFetchClient("/api/settings", { method: "PUT", body: JSON.stringify(values) });
      setStatus("Guardado.");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="login-card" style={{ maxWidth: 520, margin: 0 }} onSubmit={handleSubmit}>
      {!canEdit && (
        <p className="error-text" style={{ color: "var(--text-muted)" }}>
          Solo un administrador puede editar esta configuración. La ves en modo lectura.
        </p>
      )}

      {FIELDS.map(field => (
        <div className="field" key={field.key}>
          <label htmlFor={field.key}>{field.label}</label>
          {field.type === "textarea" ? (
            <textarea
              id={field.key}
              rows={3}
              disabled={!canEdit}
              placeholder={field.placeholder}
              value={values[field.key] ?? ""}
              onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}
            />
          ) : (
            <input
              id={field.key}
              type="text"
              disabled={!canEdit}
              placeholder={field.placeholder}
              value={values[field.key] ?? ""}
              onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}
            />
          )}
        </div>
      ))}

      {canEdit && (
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      )}

      {status && <p style={{ marginTop: 12, fontSize: "0.85rem" }}>{status}</p>}
    </form>
  );
}
