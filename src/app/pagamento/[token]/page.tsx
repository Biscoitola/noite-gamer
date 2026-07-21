import Image from "next/image";
import { notFound } from "next/navigation";
import { ButtonLink, Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { getRegistrationByToken } from "@/lib/registrations/service";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const registration = await getRegistrationByToken(token);
  if (!registration) notFound();
  const payment = registration.payments[0];
  return (
    <>
      <PublicHeader />
      <Container className="grid gap-5">
      <h1 className="text-3xl font-black">Pagamento Pix</h1>
      <Panel className="grid gap-4">
        <p className="text-[#A3A3A3]">Protocolo {registration.protocol}</p>
        <strong className="text-2xl text-[#FFD400]">Status: {registration.status}</strong>
        {payment && registration.status !== "CONFIRMADA" ? (
          <>
            <Image src={payment.qrCodeImage} alt="QR Code Pix" width={320} height={320} className="bg-white p-2" unoptimized />
            <textarea className="min-h-28 border border-[#FFD400]/35 bg-black p-3 text-sm" readOnly value={payment.qrCodeText} />
            <p>Valor: R$ {Number(payment.amount).toFixed(2)}</p>
            {payment.provider === "manualpix" ? (
              <div className="border border-[#FFD400]/50 bg-[#FFD400]/10 p-4 text-sm leading-6">
                <strong className="block text-[#FFD400]">Importante para confirmar sua inscricao</strong>
                <p>Faca o Pix exatamente no valor exibido. Pix com valor diferente pode nao ser identificado automaticamente.</p>
                <p>
                  Na descricao/identificacao do Pix, informe seu nome completo:
                  <strong> {registration.participant.fullName}</strong>
                </p>
                <p>A inscricao ficara aguardando pagamento ate a organizacao importar o extrato PDF do banco e confirmar o pagamento.</p>
              </div>
            ) : null}
          </>
        ) : (
          <p>Pagamento confirmado. Sua inscricao esta oficializada.</p>
        )}
        <ButtonLink href={`/inscricao/${token}`}>Ver inscricao</ButtonLink>
      </Panel>
      </Container>
    </>
  );
}
