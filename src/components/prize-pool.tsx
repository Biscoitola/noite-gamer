import { Panel } from "@/components/ui";
import { AutoRefresh } from "@/components/auto-refresh";
import { formatBRL } from "@/lib/edition-settings";

export function PrizePool({ pool }: { pool: { amount: number; percent: number } | null }) {
  if (!pool) return null;
  return (
    <Panel className="grid gap-2">
      <AutoRefresh intervalMs={30000} />
      <h2 className="text-xl font-black text-[#A855F7]">Prêmio acumulado da edição</h2>
      <p className="text-4xl font-black text-[#00FF88]">{formatBRL(pool.amount)}</p>
      <p className="text-sm text-[#D4D4D4]">A premiação cresce com as inscrições: {pool.percent.toLocaleString("pt-BR")}% do valor dos pagamentos confirmados vai para o prêmio.</p>
    </Panel>
  );
}
