import { listConversations, getConversationWithMessages, sendReply } from "../services/conversation.service.js";

export async function listConversationsHandler(req, res) {
  const conversations = await listConversations(req.user.location_id);
  res.json({ conversations });
}

export async function getConversationHandler(req, res) {
  const conversation = await getConversationWithMessages(Number(req.params.id), req.user.location_id);
  if (!conversation) return res.status(404).json({ error: "Conversación no encontrada" });
  res.json({ conversation });
}

export async function sendMessageHandler(req, res) {
  if (!req.body.content || typeof req.body.content !== "string") {
    return res.status(400).json({ error: "content es requerido" });
  }

  try {
    await sendReply({
      conversationId: Number(req.params.id),
      locationId: req.user.location_id,
      userId: req.user.id,
      content: req.body.content
    });
    res.status(201).json({ ok: true });
  } catch (error) {
    const status = error.status ?? 500;
    if (status === 500) console.error("Error al enviar mensaje:", error);
    res.status(status).json({ error: (status === 500 ? "Error interno" : error.message) || "Error interno" });
  }
}
