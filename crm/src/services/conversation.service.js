import { pool } from "../config/db.js";
import { findOrCreateCustomer } from "./customer.service.js";
import { sendWhatsAppMessage } from "./whatsapp.service.js";

async function findOrCreateConversation({ locationId, customerId }) {
  const existing = await pool.query(
    `SELECT id FROM whatsapp_conversations WHERE location_id = $1 AND customer_id = $2`,
    [locationId, customerId]
  );
  if (existing.rows.length > 0) return existing.rows[0].id;

  const inserted = await pool.query(
    `INSERT INTO whatsapp_conversations (location_id, customer_id) VALUES ($1, $2) RETURNING id`,
    [locationId, customerId]
  );
  return inserted.rows[0].id;
}

async function saveMessage({ conversationId, direction, content, messageType = "text", mediaUrl, waMessageId, sentByUserId }) {
  await pool.query(
    `INSERT INTO whatsapp_messages (conversation_id, direction, message_type, content, media_url, wa_message_id, sent_by_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [conversationId, direction, messageType, content ?? null, mediaUrl ?? null, waMessageId ?? null, sentByUserId ?? null]
  );
  await pool.query(`UPDATE whatsapp_conversations SET last_message_at = now() WHERE id = $1`, [conversationId]);
}

export async function saveIncomingMessage({ locationId, rawPhone, contactName, content, messageType, waMessageId }) {
  const customer = await findOrCreateCustomer(pool, { locationId, rawPhone, name: contactName });
  const conversationId = await findOrCreateConversation({ locationId, customerId: customer.id });
  await saveMessage({ conversationId, direction: "entrante", content, messageType, waMessageId });
  return conversationId;
}

export async function listConversations(locationId) {
  const result = await pool.query(
    `SELECT c.id, c.status, c.last_message_at, cu.id AS customer_id, cu.name AS customer_name,
            cu.phone_normalized AS customer_phone,
            (SELECT content FROM whatsapp_messages m WHERE m.conversation_id = c.id
             ORDER BY m.created_at DESC LIMIT 1) AS last_message
     FROM whatsapp_conversations c
     JOIN customers cu ON cu.id = c.customer_id
     WHERE c.location_id = $1
     ORDER BY c.last_message_at DESC NULLS LAST`,
    [locationId]
  );
  return result.rows;
}

export async function getConversationWithMessages(conversationId, locationId) {
  const conversationResult = await pool.query(
    `SELECT c.id, c.status, c.last_message_at, cu.id AS customer_id, cu.name AS customer_name,
            cu.phone_normalized AS customer_phone
     FROM whatsapp_conversations c
     JOIN customers cu ON cu.id = c.customer_id
     WHERE c.id = $1 AND c.location_id = $2`,
    [conversationId, locationId]
  );
  if (conversationResult.rows.length === 0) return null;

  const messagesResult = await pool.query(
    `SELECT id, direction, message_type, content, media_url, created_at
     FROM whatsapp_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [conversationId]
  );

  return { ...conversationResult.rows[0], messages: messagesResult.rows };
}

export async function sendReply({ conversationId, locationId, userId, content }) {
  const conversationResult = await pool.query(
    `SELECT c.id, cu.phone_normalized AS customer_phone
     FROM whatsapp_conversations c
     JOIN customers cu ON cu.id = c.customer_id
     WHERE c.id = $1 AND c.location_id = $2`,
    [conversationId, locationId]
  );

  if (conversationResult.rows.length === 0) {
    const error = new Error("Conversación no encontrada.");
    error.status = 404;
    throw error;
  }

  const { customer_phone: customerPhone } = conversationResult.rows[0];
  await sendWhatsAppMessage(customerPhone, content);
  await saveMessage({ conversationId, direction: "saliente", content, sentByUserId: userId });
}

export async function notifyCustomerByLocation({ locationId, customerId, content }) {
  const conversationId = await findOrCreateConversation({ locationId, customerId });
  const customerResult = await pool.query(`SELECT phone_normalized FROM customers WHERE id = $1`, [customerId]);
  if (customerResult.rows.length === 0) return;

  await sendWhatsAppMessage(customerResult.rows[0].phone_normalized, content);
  await saveMessage({ conversationId, direction: "saliente", content });
}
