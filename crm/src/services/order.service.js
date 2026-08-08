async function resolveItems(client, { locationId, items }) {
  const resolved = [];

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      const error = new Error(`Cantidad inválida para el producto ${item.id}.`);
      error.status = 400;
      throw error;
    }

    const productResult = await client.query(
      `SELECT id, name, price FROM products WHERE location_id = $1 AND external_id = $2 AND active = true`,
      [locationId, String(item.id)]
    );

    if (productResult.rows.length === 0) {
      const error = new Error(`El producto ${item.id} no existe o no está disponible.`);
      error.status = 422;
      throw error;
    }

    const product = productResult.rows[0];
    resolved.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity
    });
  }

  return resolved;
}

export async function createOrder(client, {
  locationId,
  customerId,
  items,
  deliveryMethod,
  address,
  paymentMethod,
  cashAmount,
  notes
}) {
  const resolvedItems = await resolveItems(client, { locationId, items });
  const subtotal = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const orderResult = await client.query(
    `INSERT INTO orders
       (location_id, customer_id, subtotal, total, delivery_method, address, payment_method, cash_amount, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, created_at`,
    [
      locationId,
      customerId,
      subtotal,
      total,
      deliveryMethod,
      address || null,
      paymentMethod,
      cashAmount || null,
      notes || null
    ]
  );

  const orderId = orderResult.rows[0].id;
  const orderNumber = `CATA-${String(orderId).padStart(5, "0")}`;
  await client.query(`UPDATE orders SET order_number = $1 WHERE id = $2`, [orderNumber, orderId]);

  for (const item of resolvedItems) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_purchase)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, item.productId, item.name, item.quantity, item.price]
    );
  }

  return {
    id: orderId,
    orderNumber,
    subtotal,
    total,
    status: "nuevo",
    createdAt: orderResult.rows[0].created_at,
    items: resolvedItems
  };
}
