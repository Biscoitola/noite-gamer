import { Container } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { RegistrationLookupForm } from "./lookup-form";

export const dynamic = "force-dynamic";

export default function MyRegistrationPage() {
  return (
    <div className="page-shell min-h-screen">
      <PublicHeader />
      <Container className="grid max-w-6xl gap-6">
        <header className="page-hero">
          <p className="page-eyebrow">Area do participante</p>
          <h1 className="page-title">Minha <strong>inscricao</strong></h1>
          <p className="page-lede">Consulte protocolo, pagamento, jogos selecionados e ticket de sorteio usando o WhatsApp cadastrado.</p>
        </header>
        <RegistrationLookupForm />
      </Container>
    </div>
  );
}
