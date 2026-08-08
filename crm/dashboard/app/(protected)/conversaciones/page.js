import Link from "next/link";
import { apiFetch } from "../../../lib/api.js";

const dateFmt = value => value ? new Date(value).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default async function ConversationsPage() {
  const { conversations } = await apiFetch("/api/conversations");

  return (
    <>
      <div className="page-header">
        <h1>Conversaciones</h1>
      </div>

      <div className="table-wrap">
        {conversations.length === 0 ? (
          <p className="empty-state">Todavía no hay conversaciones de WhatsApp.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Último mensaje</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map(conversation => (
                <tr key={conversation.id}>
                  <td><Link href={`/conversaciones/${conversation.id}`}>{conversation.customer_name || "Sin nombre"}</Link></td>
                  <td>{conversation.customer_phone}</td>
                  <td style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conversation.last_message || "—"}
                  </td>
                  <td>{dateFmt(conversation.last_message_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
