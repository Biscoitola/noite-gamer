import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";

export default function PrivacyPage() {
  return (
    <div className="page-shell min-h-screen">
      <PublicHeader />
      <Container className="grid max-w-5xl gap-6">
        <header className="page-hero">
          <p className="page-eyebrow">Nexus Arena - 2a Edicao</p>
          <h1 className="page-title">Politica de <strong>Privacidade</strong></h1>
          <p className="page-lede">
            Esta politica explica como os dados dos participantes sao coletados e usados para inscricao, pagamento,
            check-in, organizacao dos torneios e comunicacoes da Nexus Arena.
          </p>
        </header>

        <PrivacySection title="1. Quem controla os dados">
          <p>
            A organizacao da Nexus Arena, realizada no HARP em Tapejara/RS, e responsavel pelo tratamento dos dados
            informados no sistema do evento. O contato oficial da organizacao deve ser divulgado nos canais do evento.
          </p>
        </PrivacySection>

        <PrivacySection title="2. Dados coletados">
          <ul>
            <li>Nick ou nome publico para exibicao nas chaves.</li>
            <li>WhatsApp.</li>
            <li>Modalidades escolhidas.</li>
            <li>Status de inscricao, pagamento, check-in e resultados.</li>
            <li>Consentimentos de regulamento, privacidade e uso de imagem, quando aplicavel.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="3. Finalidades de uso">
          <ul>
            <li>Registrar inscricoes no evento.</li>
            <li>Gerar e acompanhar pagamentos Pix.</li>
            <li>Confirmar vagas apos pagamento aprovado.</li>
            <li>Evitar duplicidade de inscricoes na mesma modalidade.</li>
            <li>Realizar check-in no dia do evento.</li>
            <li>Gerar chaves, confrontos, resultados e ranking final.</li>
            <li>Entrar em contato sobre inscricao, pagamento, horario, chamada de partida ou informacoes operacionais.</li>
            <li>Gerar relatorios administrativos e financeiros do evento.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="4. Base legal e principios">
          <p>
            O tratamento dos dados segue principios da Lei Geral de Protecao de Dados, incluindo finalidade,
            necessidade, transparencia, seguranca, prevencao e responsabilizacao. Os dados sao usados apenas para
            operacao do evento e atividades diretamente relacionadas.
          </p>
        </PrivacySection>

        <PrivacySection title="5. Dados publicos">
          <p>
            As telas publicas de torneio exibem somente informacoes necessarias para acompanhar a competicao, como nick,
            modalidade, confrontos e resultados. WhatsApp e dados de pagamento ficam restritos ao painel administrativo.
          </p>
        </PrivacySection>

        <PrivacySection title="6. Pagamentos">
          <p>
            O sistema pode usar um provedor externo para gerar cobrancas Pix, validar webhooks e confirmar pagamentos.
            O sistema nao armazena dados de cartao. Identificadores de transacao, status, valores e dados tecnicos
            necessarios podem ser mantidos para auditoria e conciliacao.
          </p>
        </PrivacySection>

        <PrivacySection title="7. Compartilhamento">
          <p>Os dados podem ser acessados por:</p>
          <ul>
            <li>Equipe administrativa autorizada da Nexus Arena.</li>
            <li>Provedor de pagamento, quando necessario para processar Pix.</li>
            <li>Servicos de e-mail ou notificacao, quando configurados.</li>
            <li>Autoridades competentes, quando houver obrigacao legal.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="8. Seguranca">
          <ul>
            <li>O painel administrativo exige login.</li>
            <li>Senhas sao armazenadas com hash.</li>
            <li>Tokens publicos de consulta devem ser imprevisiveis.</li>
            <li>Dados sensiveis nao devem aparecer em logs publicos.</li>
            <li>Acesso administrativo deve ser limitado a pessoas autorizadas.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="9. Retencao e exclusao">
          <p>
            Os dados podem ser mantidos pelo tempo necessario para organizar o evento, prestar contas, resolver disputas,
            cumprir obrigacoes legais e manter historico administrativo. O participante pode solicitar correcao,
            atualizacao ou exclusao dos dados, observadas obrigacoes legais e registros necessarios de auditoria.
          </p>
        </PrivacySection>

        <PrivacySection title="10. Direitos do participante">
          <ul>
            <li>Confirmar se seus dados sao tratados.</li>
            <li>Solicitar acesso aos dados cadastrados.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar exclusao ou anonimizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o quando aplicavel.</li>
            <li>Revogar consentimentos quando o tratamento depender deles.</li>
            <li>Solicitar informacoes sobre compartilhamento.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="11. Uso de imagem">
          <p>
            Caso o participante aceite a autorizacao de uso de imagem, fotos e videos feitos durante o evento poderao
            ser usados para divulgacao da Nexus Arena em redes sociais, materiais promocionais e registros da edicao.
            Quando a autorizacao nao for concedida, a organizacao deve avaliar medidas razoaveis para evitar uso
            individual identificavel.
          </p>
        </PrivacySection>

        <PrivacySection title="12. Alteracoes">
          <p>
            Esta politica pode ser atualizada para refletir mudancas no evento, no sistema ou em exigencias legais. A
            versao vigente deve ficar disponivel no site da Nexus Arena.
          </p>
        </PrivacySection>
      </Container>
    </div>
  );
}

function PrivacySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel className="interactive-panel privacy-copy">
      <h2 className="text-xl font-black text-[#A855F7]">{title}</h2>
      <div className="mt-3 grid gap-3 leading-7 text-[#D4D4D4]">{children}</div>
    </Panel>
  );
}
