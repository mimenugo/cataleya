import { env } from "../config/env.js";

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

// Fase 1: solo recibe y confirma; el histórico de conversaciones llega en Fase 3.
export function receiveWebhookHandler(req, res) {
  const entries = req.body?.entry ?? [];
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? [];
      for (const message of messages) {
        console.log(`[whatsapp] Mensaje entrante de ${message.from}:`, message.text?.body ?? message.type);
      }
    }
  }
  res.sendStatus(200);
}
