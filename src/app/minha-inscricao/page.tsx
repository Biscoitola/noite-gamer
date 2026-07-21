import { Container } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { RegistrationLookupForm } from "./lookup-form";

export const dynamic = "force-dynamic";

export default function MyRegistrationPage() {
  return (
    <>
      <PublicHeader />
      <Container className="grid gap-5">
        <div>
          <p className="text-sm font-black uppercase text-[#B45CFF]">Area do participante</p>
          <h1 className="text-3xl font-black text-glow">Minha inscricao</h1>
        </div>
        <RegistrationLookupForm />
      </Container>
    </>
  );
}
