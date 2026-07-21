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
    <>
      <PublicHeader />
      <Container className="grid gap-5">
      <h1 className="text-3xl font-black">Sua inscricao</h1>
      <Panel>
        <p className="text-[#A3A3A3]">Protocolo</p>
        <strong className="text-2xl text-[#FFD400]">{registration.protocol}</strong>
        <p className="mt-4 text-[#A3A3A3]">Ticket para sorteios</p>
        <strong className="text-xl text-[#FFD400]">{registration.raffleCode ?? registration.protocol}</strong>
        <p className="mt-4">Nome publico: {registration.participant.publicName}</p>
        <p>Status: {registration.status}</p>
        <ul className="mt-4 grid gap-2">
          {registration.items.map((item) => <li key={item.id}>{item.game.name} - {item.status}</li>)}
        </ul>
      </Panel>
      </Container>
    </>
  );
}
