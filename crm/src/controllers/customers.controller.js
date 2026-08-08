import { listCustomers, getCustomerProfile } from "../services/customer.service.js";

export async function listCustomersHandler(req, res) {
  const customers = await listCustomers({
    locationId: req.user.location_id,
    search: req.query.search
  });
  res.json({ customers });
}

export async function getCustomerHandler(req, res) {
  const customer = await getCustomerProfile(Number(req.params.id), req.user.location_id);
  if (!customer) return res.status(404).json({ error: "Cliente no encontrado" });
  res.json({ customer });
}
