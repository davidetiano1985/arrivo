import type { Metadata } from "next";
import "./globals.css";

import NextAuthSessionProvider from "../components/SessionProvider";

export const metadata: Metadata = {
  title: "Arrivo — Prenota, ordina e arriva senza attese",
  description: "Arrivo è la piattaforma food-tech italiana per prenotare tavoli, ordinare in anticipo e pagare online. Nessuna attesa, nessuna coda.",
  metadataBase: new URL("https://arrivoapp.it"),
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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Arrivo — Prenota, ordina e arriva senza attese",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arrivo — Prenota, ordina e arriva senza attese",
    description: "Prenota il tavolo, ordina in anticipo e paga online. Quando arrivi, il posto è pronto e il piatto è in cucina.",
    images: ["/opengraph-image"],
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
