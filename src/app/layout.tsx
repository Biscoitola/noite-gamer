import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noite Gamer - 2a Edicao",
  description: "Inscricoes, pagamentos Pix e torneios da Noite Gamer no HARP em Tapejara/RS.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Noite Gamer - 2a Edicao",
    description: "FIFA 23, Mortal Kombat e Guitar Hero no HARP.",
    images: ["/share-placeholder.svg"]
  }
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
