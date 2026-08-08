import Link from "next/link";
import { apiFetch } from "../../../lib/api.js";

const money = value => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
const dateFmt = value => value ? new Date(value).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default async function CustomersPage({ searchParams }) {
  const search = searchParams?.search ?? "";
  const { customers } = await apiFetch(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`);

  return (
    <>
      <div className="page-header">
        <h1>Clientes</h1>
      </div>

      <form method="get" style={{ marginBottom: 20 }}>
        <input
          className="search-input"
          type="search"
          name="search"
          placeholder="Buscar por nombre o teléfono…"
          defaultValue={search}
        />
      </form>

      <div className="table-wrap">
        {customers.length === 0 ? (
          <p className="empty-state">No hay clientes que coincidan con la búsqueda.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Pedidos</th>
                <th>Total gastado</th>
                <th>Última compra</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td><Link href={`/clientes/${customer.id}`}>{customer.name || "Sin nombre"}</Link></td>
                  <td>{customer.phone_normalized}</td>
                  <td>{customer.order_count}</td>
                  <td>{money(customer.lifetime_value)}</td>
                  <td>{dateFmt(customer.last_order_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
