import { notFound } from "next/navigation";
import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { getRegistrationByToken } from "@/lib/registrations/service";

export const dynamic = "force-dynamic";

export default async function RegistrationStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const registration = await getRegistrationByToken(token);
  if (!registration) notFound();
  return (
    <div className="page-shell min-h-screen">
      <PublicHeader />
      <Container className="grid max-w-5xl gap-6">
      <header className="page-hero">
        <p className="page-eyebrow">Area do participante</p>
        <h1 className="page-title">Sua <strong>inscricao</strong></h1>
        <p className="page-lede">Guarde o protocolo e acompanhe o status da sua participacao na Nexus Arena.</p>
      </header>
      <Panel>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="neon-tile">
            <p className="text-[#A3A3A3]">Protocolo</p>
            <strong className="text-2xl text-[#A855F7]">{registration.protocol}</strong>
          </div>
          <div className="neon-tile">
            <p className="text-[#A3A3A3]">Ticket para sorteios</p>
            <strong className="text-xl text-[#00FF88]">{registration.raffleCode ?? registration.protocol}</strong>
          </div>
          <div className="neon-tile">
            <p className="text-[#A3A3A3]">Nome publico</p>
            <strong>{registration.participant.publicName}</strong>
          </div>
          <div className="neon-tile">
            <p className="text-[#A3A3A3]">Status</p>
            <strong>{registration.status}</strong>
          </div>
        </div>
        <p className="mt-4">Valor: R$ {Number(registration.totalAmount).toFixed(2)}</p>
        {registration.couponCode ? (
          <p>Cupom: {registration.couponCode} (-R$ {Number(registration.couponDiscount).toFixed(2)})</p>
        ) : null}
        <ul className="mt-4 grid gap-2">
          {registration.items.map((item) => (
            <li className="neon-tile" key={item.id}>
              <strong>{item.game.name} - {item.status}</strong>
              {item.game.teamMode === "DOUBLES" ? (
                <p className="mt-1 text-sm text-[#D4D4D4]">
                  Dupla: {item.teamName ?? `${registration.participant.publicName} + ${item.teammateName ?? "parceiro"}`}
                  {item.teammateName ? ` | Parceiro: ${item.teammateName}` : ""}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </Panel>
      </Container>
    </div>
  );
}
