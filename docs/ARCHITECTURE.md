# Arquitetura

A aplicacao usa Next.js como frontend e backend. O dominio fica em `src/lib`, as paginas em `src/app` e o banco em PostgreSQL via Prisma.

Fluxos principais:

- Participante cria inscricao publica sem conta.
- Servidor calcula valor, reserva vaga e cria Pix via `PaymentProvider`.
- Webhook validado e idempotente confirma pagamento e oficializa inscricao.
- Admin usa sessao HttpOnly para dashboard, check-in, pagamentos, exportacao e torneios.
- Chaves publicas leem apenas nomes publicos dos participantes.
