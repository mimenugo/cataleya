import { apiFetch } from "../../../lib/api.js";
import SettingsForm from "./SettingsForm.js";

export default async function SettingsPage() {
  const [{ settings }, { user }] = await Promise.all([
    apiFetch("/api/settings"),
    apiFetch("/api/me")
  ]);

  return (
    <>
      <div className="page-header">
        <h1>Configuración</h1>
      </div>
      <SettingsForm initialSettings={settings} canEdit={user.role === "admin"} />
    </>
  );
}
