import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";

export default function RulesPage() {
  return (
    <>
      <PublicHeader />
      <Container className="grid max-w-5xl gap-5">
        <header className="grid gap-2">
          <p className="text-sm font-black uppercase text-[#B45CFF]">Noite Gamer - 2a Edicao</p>
          <h1 className="text-4xl font-black text-glow">Regulamento</h1>
          <p className="max-w-3xl text-[#D4D4D4]">
            Este regulamento orienta inscricoes, pagamentos, check-in, conduta e disputas das modalidades da Noite Gamer
            realizada no HARP, em Tapejara/RS.
          </p>
        </header>

        <RulesSection title="1. Participacao">
          <RuleItem>Qualquer participante inscrito corretamente e com pagamento confirmado pode disputar as modalidades selecionadas.</RuleItem>
          <RuleItem>A inscricao e pessoal e deve conter nome completo, WhatsApp, cidade, nick publico e aceite dos termos.</RuleItem>
          <RuleItem>O nick publico sera usado nas chaves e telas publicas. Dados pessoais nao serao exibidos publicamente.</RuleItem>
          <RuleItem>A organizacao pode recusar nomes ofensivos, discriminatorios ou que prejudiquem a identificacao do participante.</RuleItem>
        </RulesSection>

        <RulesSection title="2. Inscricao e pagamento">
          <RuleItem>A vaga so e confirmada apos aprovacao do pagamento Pix no sistema.</RuleItem>
          <RuleItem>Inscricoes com Pix pendente nao garantem participacao definitiva.</RuleItem>
          <RuleItem>Quando o prazo de pagamento expirar, a reserva pode ser liberada para outro participante.</RuleItem>
          <RuleItem>O comprovante manual pode ser analisado pela administracao, mas a confirmacao oficial deve constar no painel.</RuleItem>
          <RuleItem>Em caso de erro de pagamento, duplicidade ou cancelamento, a organizacao avaliara a situacao pelo painel administrativo.</RuleItem>
        </RulesSection>

        <RulesSection title="3. Check-in no evento">
          <RuleItem>O participante deve comparecer no horario divulgado e realizar check-in antes de disputar.</RuleItem>
          <RuleItem>Somente inscricoes confirmadas podem realizar check-in.</RuleItem>
          <RuleItem>A organizacao pode exigir documento, protocolo, WhatsApp ou QR Code individual para confirmar a identidade.</RuleItem>
          <RuleItem>Atrasos podem gerar desclassificacao ou substituicao, conforme decisao da organizacao.</RuleItem>
        </RulesSection>

        <RulesSection title="4. Formato dos torneios">
          <RuleItem>O formato inicial e eliminacao simples, no sistema mata-mata.</RuleItem>
          <RuleItem>Cada modalidade possui sua propria chave.</RuleItem>
          <RuleItem>Quando houver numero impar ou chave incompleta, o sistema pode aplicar BYE automaticamente.</RuleItem>
          <RuleItem>Participante com BYE avanca automaticamente para a fase seguinte.</RuleItem>
          <RuleItem>A organizacao pode sortear, definir seeds manualmente ou reorganizar participantes antes de iniciar a chave.</RuleItem>
        </RulesSection>

        <RulesSection title="5. Conduta">
          <RuleItem>Respeito aos participantes, publico, equipe e local e obrigatorio.</RuleItem>
          <RuleItem>Ofensas, ameacas, discriminacao, provocacoes excessivas, dano a equipamentos ou tentativa de fraude podem gerar desclassificacao.</RuleItem>
          <RuleItem>O participante deve usar os equipamentos conforme orientacao da equipe.</RuleItem>
          <RuleItem>Decisoes da organizacao durante o evento buscam preservar ordem, seguranca e andamento do torneio.</RuleItem>
        </RulesSection>

        <RulesSection title="6. FIFA 23">
          <RuleItem>As partidas serao disputadas em formato definido pela organizacao no dia do evento.</RuleItem>
          <RuleItem>Configuracoes como tempo de jogo, dificuldade, controles, times permitidos, prorrogacao e penaltis podem ser ajustadas antes do inicio.</RuleItem>
          <RuleItem>Em caso de empate, a organizacao definira prorrogacao, penaltis ou criterio equivalente.</RuleItem>
          <RuleItem>Falhas tecnicas devem ser comunicadas imediatamente. A equipe decide se a partida continua, reinicia ou e reagendada.</RuleItem>
        </RulesSection>

        <RulesSection title="7. Mortal Kombat">
          <RuleItem>O confronto pode ser melhor de 1, 3 ou 5, conforme configuracao da modalidade.</RuleItem>
          <RuleItem>A escolha de personagens, arenas e troca de personagem segue a regra definida pela organizacao antes do inicio.</RuleItem>
          <RuleItem>O vencedor e quem atingir primeiro o numero de vitorias exigido no confronto.</RuleItem>
          <RuleItem>Pausas indevidas, abandono de controle ou interrupcao intencional podem resultar em derrota na partida.</RuleItem>
        </RulesSection>

        <RulesSection title="8. Guitar Hero">
          <RuleItem>A organizacao definira musica, setlist, dificuldade e criterio de pontuacao antes da rodada.</RuleItem>
          <RuleItem>O vencedor sera definido por pontuacao, percentual de acertos ou criterio informado pela equipe.</RuleItem>
          <RuleItem>Falha de controle, guitarra ou sistema deve ser informada imediatamente.</RuleItem>
          <RuleItem>Quando necessario, a organizacao pode repetir uma musica ou substituir o equipamento.</RuleItem>
        </RulesSection>

        <RulesSection title="9. Resultados e recursos">
          <RuleItem>Resultados devem ser registrados pela administracao no sistema.</RuleItem>
          <RuleItem>Correcoes so podem ocorrer quando a partida seguinte ainda nao tiver sido decidida, salvo decisao excepcional da organizacao.</RuleItem>
          <RuleItem>Contestacoes devem ser feitas imediatamente apos a partida.</RuleItem>
          <RuleItem>A decisao final sobre casos omissos cabe a organizacao da Noite Gamer.</RuleItem>
        </RulesSection>

        <RulesSection title="10. Imagem, premiacao e alteracoes">
          <RuleItem>O participante que aceitar uso de imagem autoriza registros de foto e video do evento para divulgacao da Noite Gamer.</RuleItem>
          <RuleItem>Premiacoes, brindes e sorteios serao informados pela organizacao e podem depender de presenca no momento da entrega.</RuleItem>
          <RuleItem>A organizacao pode atualizar horarios, regras operacionais ou ordem das partidas para garantir o bom andamento do evento.</RuleItem>
        </RulesSection>
      </Container>
    </>
  );
}

function RulesSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel className="interactive-panel">
      <h2 className="text-xl font-black text-[#FFD400]">{title}</h2>
      <ul className="mt-3 grid gap-2 text-[#D4D4D4]">{children}</ul>
    </Panel>
  );
}

function RuleItem({ children }: { children: React.ReactNode }) {
  return <li className="border-l-2 border-[#B45CFF]/60 pl-3 leading-7">{children}</li>;
}
