import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Las Mesas Café Bar · Pedidos",
  description: "Pide desde tu mesa o para llevar en Las Mesas Café Bar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-crema text-negro antialiased`}>
        {children}
      </body>
    </html>
  );
}
