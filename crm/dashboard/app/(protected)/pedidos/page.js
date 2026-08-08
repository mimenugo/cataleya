import { apiFetch } from "../../../lib/api.js";
import KanbanBoard from "./KanbanBoard.js";

export default async function OrdersPage() {
  const { orders } = await apiFetch("/api/orders");

  return (
    <>
      <div className="page-header">
        <h1>Pedidos</h1>
      </div>
      <KanbanBoard initialOrders={orders} />
    </>
  );
}
