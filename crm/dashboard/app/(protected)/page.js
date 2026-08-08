import { apiFetch } from "../../lib/api.js";

const money = value => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

const STATUS_LABELS = { nuevo: "Nuevo", preparacion: "Preparación", listo: "Listo", entregado: "Entregado" };

export default async function TodayDashboardPage() {
  const summary = await apiFetch("/api/dashboard/today");

  return (
    <>
      <div className="page-header">
        <h1>Hoy</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Pedidos de hoy</div>
          <div className="value">{summary.orderCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Ventas de hoy</div>
          <div className="value">{money(summary.totalSales)}</div>
        </div>
        {Object.entries(summary.byStatus).map(([status, count]) => (
          <div className="stat-card" key={status}>
            <div className="label">{STATUS_LABELS[status] ?? status}</div>
            <div className="value">{count}</div>
          </div>
        ))}
      </div>
    </>
  );
}
