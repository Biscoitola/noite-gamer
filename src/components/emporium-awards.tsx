import { Panel } from "@/components/ui";

const awards = [
  { place: "1º lugar", image: "emporium-1-lugar.jpeg", description: "R$ 150 + R$ 100 em vale-compras na Âmbar Skateshop." },
  { place: "2º lugar", image: "emporium-2-lugar.jpeg", description: "R$ 100 + R$ 100 em vale-compras na Âmbar Skateshop." },
  { place: "3º lugar", image: "emporium-3-lugar.jpeg", description: "R$ 30 + 1 corte de cabelo na Lima Barbearia." }
];

export function EmporiumAwards() {
  return (
    <section className="grid gap-4" aria-label="Premiação The Games Emporium">
      <div>
        <p className="text-sm font-black uppercase text-[#B45CFF]">Premiação oficial · FC26</p>
        <h2 className="text-3xl font-black text-glow">The Games Emporium</h2>
        <p className="mt-2 text-sm text-[#D4D4D4]">Prêmios para os três primeiros colocados.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {awards.map((award) => (
          <Panel className="interactive-panel grid content-start gap-3" key={award.place}>
            <img
              src={`/assets/premios/${award.image}`}
              alt={`${award.place}: ${award.description}`}
              className="h-auto w-full rounded-[6px] object-contain"
              loading="lazy"
            />
            <div>
              <h3 className="text-xl font-black text-[#A855F7]">{award.place}</h3>
              <p className="mt-1 text-sm leading-6 text-[#D4D4D4]">{award.description}</p>
            </div>
          </Panel>
        ))}
      </div>
    </section>
  );
}
