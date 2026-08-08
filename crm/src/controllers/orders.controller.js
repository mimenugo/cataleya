import { withTransaction } from "../config/db.js";
import { getDefaultLocation } from "../services/location.service.js";
import { findOrCreateCustomer, registerCustomerOrder } from "../services/customer.service.js";
import { createOrder, listOrders, updateOrderStatus } from "../services/order.service.js";

function validateBody(body) {
  const errors = [];
  if (!body.phone || typeof body.phone !== "string") errors.push("phone es requerido");
  if (!body.name || typeof body.name !== "string") errors.push("name es requerido");
  if (!Array.isArray(body.items) || body.items.length === 0) errors.push("items debe ser un arreglo no vacío");
  if (!body.delivery || typeof body.delivery !== "string") errors.push("delivery es requerido");
  if (body.delivery === "A domicilio" && !body.address) errors.push("address es requerido para entrega a domicilio");
  if (!body.payment || typeof body.payment !== "string") errors.push("payment es requerido");
  return errors;
}

export async function createOrderHandler(req, res) {
  const errors = validateBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Solicitud inválida", details: errors });
  }

  try {
    const location = await getDefaultLocation();

    const result = await withTransaction(async client => {
      const customer = await findOrCreateCustomer(client, {
        locationId: location.id,
        rawPhone: req.body.phone,
        name: req.body.name
      });

      const order = await createOrder(client, {
        locationId: location.id,
        customerId: customer.id,
        items: req.body.items,
        deliveryMethod: req.body.delivery,
        address: req.body.address,
        paymentMethod: req.body.payment,
        cashAmount: req.body.cashAmount,
        notes: req.body.notes
      });

      await registerCustomerOrder(client, { customerId: customer.id, total: order.total });

      return { customer, order };
    });

    res.status(201).json({
      order: {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        subtotal: result.order.subtotal,
        total: result.order.total,
        status: result.order.status,
        createdAt: result.order.createdAt
      },
      customer: {
        id: result.customer.id,
        phoneNormalized: result.customer.phoneNormalized,
        isNew: result.customer.isNew
      }
    });
  } catch (error) {
    const status = error.status ?? 500;
    if (status === 500) console.error("Error al crear pedido:", error);
    res.status(status).json({ error: (status === 500 ? "Error interno" : error.message) || "Error interno" });
  }
}

export async function listOrdersHandler(req, res) {
  const orders = await listOrders({ locationId: req.user.location_id, status: req.query.status });
  res.json({ orders });
}

export async function updateOrderStatusHandler(req, res) {
  try {
    const order = await updateOrderStatus({
      orderId: Number(req.params.id),
      locationId: req.user.location_id,
      status: req.body.status
    });
    res.json({ order });
  } catch (error) {
    const status = error.status ?? 500;
    if (status === 500) console.error("Error al actualizar pedido:", error);
    res.status(status).json({ error: (status === 500 ? "Error interno" : error.message) || "Error interno" });
  }
}
