import Link from "next/link";
import { apiFetch } from "../../../../lib/api.js";

const money = value => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
const dateFmt = value => value ? new Date(value).toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_LABELS = { nuevo: "Nuevo", preparacion: "Preparación", listo: "Listo", entregado: "Entregado" };

export default async function CustomerProfilePage({ params }) {
  const { customer } = await apiFetch(`/api/customers/${params.id}`);

  return (
    <>
      <div className="page-header">
        <div>
          <Link href="/clientes">← Clientes</Link>
          <h1>{customer.name || "Sin nombre"}</h1>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Teléfono</div>
          <div className="value" style={{ fontSize: "1.2rem" }}>{customer.phone_normalized}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pedidos totales</div>
          <div className="value">{customer.order_count}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total gastado</div>
          <div className="value">{money(customer.lifetime_value)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Última compra</div>
          <div className="value" style={{ fontSize: "1.1rem" }}>{dateFmt(customer.last_order_at)}</div>
        </div>
      </div>

      <h2 style={{ fontSize: "1.1rem" }}>Historial de pedidos</h2>
      <div className="table-wrap">
        {customer.orders.length === 0 ? (
          <p className="empty-state">Este cliente todavía no tiene pedidos.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Estado</th>
                <th>Entrega</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map(order => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td><span className="badge">{STATUS_LABELS[order.status] ?? order.status}</span></td>
                  <td>{order.delivery_method}</td>
                  <td>{money(order.total)}</td>
                  <td>{dateFmt(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
