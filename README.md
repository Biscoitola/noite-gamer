# Noite Gamer - 2a Edicao

Sistema web responsivo para inscricoes, Pix, painel administrativo, check-in e torneios mata-mata da Noite Gamer no HARP em Tapejara/RS.

## Stack

Next.js App Router, TypeScript strict, Prisma, PostgreSQL, Tailwind CSS, Vitest e Playwright.

## Desenvolvimento

1. Copie `.env.example` para `.env`.
2. Suba o banco: `docker compose up -d postgres`.
3. Instale dependencias: `npm install`.
4. Rode migrations: `npm run db:migrate`.
5. Rode seed: `npm run db:seed`.
6. Inicie: `npm run dev`.

Admin dev: `admin@noitegamer.local` / `troque-esta-senha-dev`.

## Comandos

- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:reset`

## Pagamentos

Para producao sem mensalidade de gateway, use `PAYMENT_PROVIDER=manualpix`. O sistema gera QR Code Pix com valor exato, deixa a inscricao aguardando pagamento e o admin confirma por importacao de PDF do banco em `/admin/pagamentos`.

Antes de enviar o link para o publico, configure um banco PostgreSQL online, uma URL publica do app, uma senha forte para o admin e as variaveis de ambiente de producao.
