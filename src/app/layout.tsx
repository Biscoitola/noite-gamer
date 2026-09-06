import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Arena - Arena de Competicoes",
  description: "Inscricoes, pagamentos Pix e torneios da Nexus Arena no HARP em Tapejara/RS.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Nexus Arena - Arena de Competicoes",
    description: "FIFA 26, Mortal Kombat e Guitar Hero no HARP.",
    images: ["/assets/nexus-logo-mark.jpeg"]
  }
};

export const viewport: Viewport = {
  themeColor: "#05030A",
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
