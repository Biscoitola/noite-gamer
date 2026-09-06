import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";

export default function ContactPage() {
  return (
    <div className="page-shell min-h-screen">
      <PublicHeader />
      <Container className="grid max-w-5xl gap-6">
        <header className="page-hero">
          <p className="page-eyebrow">Fale com a organizacao</p>
          <h1 className="page-title">Contato</h1>
          <p className="page-lede">Organizacao da Nexus Arena - HARP, Tapejara/RS.</p>
        </header>
        <Panel>
          <p className="text-[#D4D4D4]">Use os canais oficiais divulgados pela organizacao para duvidas sobre inscricao, pagamento, horarios e regulamento.</p>
        </Panel>
      </Container>
    </div>
  );
}
