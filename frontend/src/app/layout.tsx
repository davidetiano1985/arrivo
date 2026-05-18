import type { Metadata } from "next";
import "./globals.css";

import NextAuthSessionProvider from "../components/SessionProvider";

export const metadata: Metadata = {
  title: "Arrivo — Prenota, ordina e arriva senza attese",
  description: "Arrivo è la piattaforma food-tech italiana per prenotare tavoli, ordinare in anticipo e pagare online. Nessuna attesa, nessuna coda.",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  );
}
