import type { Metadata } from "next";
import "./globals.css";

import NextAuthSessionProvider from "../components/SessionProvider";

export const metadata: Metadata = {
  title: "Arrivo",
  description: "Arrivo frontend"
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
