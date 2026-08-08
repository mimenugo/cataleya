import { env } from "../config/env.js";
import { getDefaultLocation } from "../services/location.service.js";
import { saveIncomingMessage } from "../services/conversation.service.js";

// Verificación del webhook exigida por Meta al configurar la suscripción.
export function verifyWebhookHandler(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

function extractContactName(value, phone) {
  const contact = value.contacts?.find(entry => entry.wa_id === phone);
  return contact?.profile?.name ?? null;
}

export async function receiveWebhookHandler(req, res) {
  const location = await getDefaultLocation();
  const entries = req.body?.entry ?? [];

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? [];
      for (const message of messages) {
        const content = message.type === "text" ? message.text?.body : `[${message.type}]`;
        await saveIncomingMessage({
          locationId: location.id,
          rawPhone: message.from,
          contactName: extractContactName(change.value, message.from),
          content,
          messageType: message.type,
          waMessageId: message.id
        });
      }
    }
  }

  res.sendStatus(200);
}
