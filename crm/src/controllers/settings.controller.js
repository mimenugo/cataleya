import { getSettings, updateSettings } from "../services/settings.service.js";

export async function getSettingsHandler(req, res) {
  const settings = await getSettings(req.user.location_id);
  res.json({ settings });
}

export async function updateSettingsHandler(req, res) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Solo un administrador puede editar la configuración" });
  }
  const settings = await updateSettings(req.user.location_id, req.body);
  res.json({ settings });
}

export function getMeHandler(req, res) {
  res.json({ user: req.user });
}
