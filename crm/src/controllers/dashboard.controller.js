import { getTodaySummary } from "../services/dashboard.service.js";

export async function getTodaySummaryHandler(req, res) {
  const summary = await getTodaySummary(req.user.location_id);
  res.json(summary);
}
