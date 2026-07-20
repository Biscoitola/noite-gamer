# Deploy

Para outras pessoas acessarem, o app precisa sair do `localhost`. Use uma hospedagem para Next.js e um PostgreSQL online.

## Caminho recomendado

1. Crie um banco PostgreSQL online, por exemplo Neon, Supabase, Railway ou Render.
2. Publique o projeto em uma hospedagem Next.js, por exemplo Vercel ou Railway.
3. Configure as variaveis de ambiente de producao na hospedagem.
4. Rode as migrations no banco online.
5. Rode o seed administrativo uma unica vez.
6. Acesse a URL publica e teste inscricao, Pix, admin, check-in e relatorios.

## Variaveis obrigatorias

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/BANCO?schema=public"
AUTH_SECRET="gere-uma-chave-grande-e-secreta"
APP_URL="https://seu-dominio.com"
PAYMENT_PROVIDER="manualpix"
PIX_KEY="sua-chave-pix"
PIX_RECEIVER_NAME="NOITE GAMER"
PIX_RECEIVER_CITY="TAPEJARA"
ADMIN_SEED_EMAIL="seu-email-admin"
ADMIN_SEED_PASSWORD="uma-senha-forte"
CRON_SECRET="gere-outra-chave-grande"
```

## Comandos de producao

```bash
npm install
npm run build
npx prisma migrate deploy
npm run db:seed
```

Em plataformas como Vercel, deixe o build command como `npm run build`. Para migrar o banco, rode `npx prisma migrate deploy` com a `DATABASE_URL` de producao configurada.

## Antes de divulgar o link

- Troque a senha admin padrao.
- Confirme que o banco usado nao e o local do Docker.
- Confira se `/admin` abre apenas com login.
- Faca uma inscricao real de teste com valor baixo ou jogo gratuito.
- Importe um PDF de extrato em `/admin/pagamentos` e confirme se a conciliacao funciona.
- Limpe dados de teste com `npm run db:clear:data` somente se estiver no banco correto.

## Acesso depois do deploy

- Publico: `https://seu-dominio.com`
- Inscricao: `https://seu-dominio.com/inscricao`
- Torneios: `https://seu-dominio.com/torneios`
- Admin: `https://seu-dominio.com/admin`

Todos os dados concedidos pelos participantes ficam no PostgreSQL online e aparecem no painel admin.
