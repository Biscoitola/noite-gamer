# Plano de Implementacao - Noite Gamer 2a Edicao

## Decisoes tecnicas

- Aplicacao full-stack em Next.js App Router com TypeScript strict.
- Banco principal PostgreSQL via Prisma.
- Autenticacao administrativa propria com senha bcrypt, sessao em cookie HttpOnly e papeis ADMIN/STAFF.
- Pagamentos por camada `PaymentProvider`; desenvolvimento usa `FakePaymentProvider`, producao fica preparada para Mercado Pago.
- Atualizacoes em tempo real por Server-Sent Events, com fallback de polling nas telas publicas.
- Dominio de torneios isolado em funcoes puras testaveis.
- UI mobile first com Tailwind CSS e componentes React acessiveis.

## Fases

1. Fundacao: criar projeto, configs, Prisma, env, Docker e scripts.
2. Dominio: precos, vagas, inscricoes, pagamentos fake, webhooks, torneios, check-in e exportacoes.
3. Publico: landing, inscricao em etapas, pagamento, consulta, torneios e ao vivo.
4. Admin: login, dashboard, inscricoes, pagamentos, participantes, check-in, torneios e configuracoes.
5. Qualidade: unit tests, integracao, E2E, lint, typecheck e build.
6. Entrega: documentacao operacional, seguranca, deploy e handover.

## Escopo da primeira entrega

A entrega implementa um sistema funcional local e pronto para deploy, com provider fake completo e arquitetura preparada para credenciais reais do gateway Pix. A integracao real com Mercado Pago exige variaveis externas e validacao de webhook do provedor em ambiente sandbox/producao.
