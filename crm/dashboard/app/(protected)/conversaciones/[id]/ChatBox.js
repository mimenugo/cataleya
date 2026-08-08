"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetchClient } from "../../../../lib/api-client.js";

const QUICK_REPLIES = [
  "¡Gracias por tu pedido! Lo estamos preparando.",
  "Tu pedido ya está listo, puedes pasar a recogerlo.",
  "¿Nos confirmas tu dirección para la entrega?",
  "En este momento estamos cerrados, te esperamos mañana."
];

export default function ChatBox({ conversationId }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend(event) {
    event.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError("");

    try {
      await apiFetchClient(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content })
      });
      setContent("");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {error && <p className="error-text">{error}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {QUICK_REPLIES.map(reply => (
          <button
            key={reply}
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "6px 10px" }}
            onClick={() => setContent(reply)}
          >
            {reply.length > 28 ? `${reply.slice(0, 28)}…` : reply}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <textarea
          rows={2}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}
          placeholder="Escribe una respuesta…"
          value={content}
          onChange={event => setContent(event.target.value)}
        />
        <button className="btn" type="submit" disabled={sending}>
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
