import "./globals.css";

export const metadata = {
  title: "mi.menugo CRM",
  description: "Panel de clientes y pedidos de Cataleya"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
