import Link from "next/link";
import LogoutButton from "../components/LogoutButton.js";

export default function ProtectedLayout({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>mi.menugo</h2>
        <nav>
          <Link href="/">Hoy</Link>
          <Link href="/clientes">Clientes</Link>
          <Link href="/pedidos">Pedidos</Link>
        </nav>
        <LogoutButton />
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
