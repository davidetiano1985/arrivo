import type { Metadata } from "next";
import "./globals.css";

import NextAuthSessionProvider from "../components/SessionProvider";

export const metadata: Metadata = {
  title: "Arrivo — Prenota, ordina e arriva senza attese",
  description: "Arrivo è la piattaforma food-tech italiana per prenotare tavoli, ordinare in anticipo e pagare online. Nessuna attesa, nessuna coda.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Arrivo — Prenota, ordina e arriva senza attese",
    description: "Prenota il tavolo, ordina in anticipo e paga online. Quando arrivi, il posto è pronto e il piatto è in cucina.",
    url: "https://arrivoapp.it",
    siteName: "Arrivo",
    locale: "it_IT",
    type: "website",
  },
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
