import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Las Mesas Cafe Bar - Pedidos",
  description: "Pide desde tu mesa o para llevar en Las Mesas Cafe Bar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="antialiased">
      <body className={`${inter.variable} bg-negro text-blanco antialiased`}>
        {children}
      </body>
    </html>
  );
}
