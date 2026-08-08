import { env } from "../config/env.js";

const GRAPH_API_URL = "https://graph.facebook.com/v20.0";

/**
 * Envía un mensaje de texto vía Meta WhatsApp Cloud API.
 * No-op con warning si aún no se configuraron las credenciales de WhatsApp Business.
 */
export async function sendWhatsAppMessage(toPhoneNormalized, text) {
  const { token, phoneNumberId } = env.whatsapp;

  if (!token || !phoneNumberId) {
    console.warn(
      `[whatsapp] Credenciales no configuradas; no se envió mensaje a ${toPhoneNormalized}: "${text}"`
    );
    return { sent: false, reason: "not_configured" };
  }

  const response = await fetch(`${GRAPH_API_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: `52${toPhoneNormalized}`,
      type: "text",
      text: { body: text }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error al enviar WhatsApp (${response.status}): ${errorBody}`);
  }

  return { sent: true };
}
