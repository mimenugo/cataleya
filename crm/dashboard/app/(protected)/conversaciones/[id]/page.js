import Link from "next/link";
import { apiFetch } from "../../../../lib/api.js";
import ChatBox from "./ChatBox.js";

const timeFmt = value => new Date(value).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function ConversationPage({ params }) {
  const { conversation } = await apiFetch(`/api/conversations/${params.id}`);

  return (
    <>
      <div className="page-header">
        <div>
          <Link href="/conversaciones">← Conversaciones</Link>
          <h1>{conversation.customer_name || conversation.customer_phone}</h1>
        </div>
        <Link href={`/clientes/${conversation.customer_id}`} className="btn btn-secondary">Ver cliente</Link>
      </div>

      <div className="table-wrap" style={{ padding: 16, marginBottom: 16, maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {conversation.messages.length === 0 && <p className="empty-state">Todavía no hay mensajes.</p>}
        {conversation.messages.map(message => (
          <div
            key={message.id}
            style={{
              alignSelf: message.direction === "saliente" ? "flex-end" : "flex-start",
              maxWidth: "70%",
              background: message.direction === "saliente" ? "var(--brand)" : "var(--bg)",
              color: message.direction === "saliente" ? "white" : "var(--text)",
              border: message.direction === "saliente" ? "none" : "1px solid var(--border)",
              borderRadius: 12,
              padding: "8px 12px"
            }}
          >
            <div>{message.content || `[${message.message_type}]`}</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: 4 }}>{timeFmt(message.created_at)}</div>
          </div>
        ))}
      </div>

      <ChatBox conversationId={conversation.id} />
    </>
  );
}
