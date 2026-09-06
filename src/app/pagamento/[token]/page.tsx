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
    <div className="page-shell min-h-screen">
      <PublicHeader />
      <Container className="grid max-w-5xl gap-6">
      <header className="page-hero">
        <p className="page-eyebrow">Confirmacao da vaga</p>
        <h1 className="page-title">Pagamento <strong>Pix</strong></h1>
        <p className="page-lede">Pague usando o QR Code ou o copia e cola para confirmar sua inscricao na edicao atual.</p>
      </header>
      <Panel className="grid gap-4">
        <p className="text-[#A3A3A3]">Protocolo {registration.protocol}</p>
        <strong className="status-pill">Status: {registration.status}</strong>
        {registration.couponCode ? (
          <p className="text-sm text-[#D4D4D4]">
            Cupom {registration.couponCode}: desconto de R$ {Number(registration.couponDiscount).toFixed(2)}
          </p>
        ) : null}
        {payment && registration.status !== "CONFIRMADA" ? (
          <>
            <Image src={payment.qrCodeImage} alt="QR Code Pix" width={320} height={320} className="rounded-[8px] bg-white p-2" unoptimized />
            <textarea className="min-h-28 rounded-[8px] border border-[#A855F7]/35 bg-black p-3 text-sm" readOnly value={payment.qrCodeText} />
            <p className="text-xl font-black text-[#00FF88]">Valor: R$ {Number(payment.amount).toFixed(2)}</p>
            {payment.provider === "manualpix" ? (
              <div className="neon-tile border-[#A855F7]/50 bg-[#A855F7]/10 p-4 text-sm leading-6">
                <strong className="block text-[#A855F7]">Importante para confirmar sua inscricao</strong>
                <p>Faca o Pix exatamente no valor exibido. Pix com valor diferente pode nao ser identificado automaticamente.</p>
                <p>O QR Code ja leva o identificador da sua inscricao: <strong>{registration.protocol}</strong>.</p>
                <p>Se o aplicativo do banco permitir descricao, pode informar seu nick, mas nao e obrigatorio.</p>
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
    </div>
  );
}
