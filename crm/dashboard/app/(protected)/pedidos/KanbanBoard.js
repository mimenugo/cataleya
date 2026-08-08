"use client";

import { useState } from "react";
import { apiFetchClient } from "../../../lib/api-client.js";

const money = value => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
const timeFmt = value => new Date(value).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

const COLUMNS = [
  { status: "nuevo", label: "Nuevo" },
  { status: "preparacion", label: "Preparación" },
  { status: "listo", label: "Listo" },
  { status: "entregado", label: "Entregado" }
];

export default function KanbanBoard({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  async function handleStatusChange(orderId, status) {
    setUpdatingId(orderId);
    setError("");
    const previous = orders;
    setOrders(current => current.map(order => order.id === orderId ? { ...order, status } : order));

    try {
      await apiFetchClient(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
    } catch (err) {
      setOrders(previous);
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      {error && <p className="error-text">{error}</p>}
      <div className="kanban">
        {COLUMNS.map(column => {
          const columnOrders = orders.filter(order => order.status === column.status);
          return (
            <div className="kanban-column" key={column.status}>
              <h3>{column.label} ({columnOrders.length})</h3>
              {columnOrders.length === 0 && <p className="empty-state" style={{ padding: 12 }}>Sin pedidos</p>}
              {columnOrders.map(order => (
                <div className="order-card" key={order.id}>
                  <div className="order-number">{order.order_number}</div>
                  <div className="order-meta">
                    {order.customer_name || order.customer_phone} · {money(order.total)} · {timeFmt(order.created_at)}
                  </div>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={event => handleStatusChange(order.id, event.target.value)}
                  >
                    {COLUMNS.map(option => (
                      <option key={option.status} value={option.status}>{option.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
