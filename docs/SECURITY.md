# Seguranca e LGPD

Protecoes implementadas:

- Senhas com bcrypt.
- Sessao administrativa em cookie HttpOnly, Secure em producao e SameSite Lax.
- Tokens publicos armazenados por hash.
- Valor da inscricao calculado no servidor.
- Webhook com assinatura e idempotencia.
- Prisma contra SQL injection.
- Coleta minima para inscricao e torneio.

Pendencias de producao:

- Configurar CSP completa.
- Trocar a senha admin padrao antes de divulgar o link.
- Conferir se `AUTH_SECRET` e `CRON_SECRET` foram gerados com valores fortes.
- Manter a chave Pix e dados sensiveis somente em variaveis de ambiente.
- Definir politica de retencao operacional.
- Configurar SMTP real para recuperacao de senha.
