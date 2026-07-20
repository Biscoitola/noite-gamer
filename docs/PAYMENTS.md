# Pagamentos

`PaymentProvider` define `createPixCharge`, `getPaymentStatus`, `cancelCharge`, `refundCharge`, `validateWebhook` e `parseWebhookEvent`.

Desenvolvimento pode usar `FakePaymentProvider`, que gera QR Code simulado e valida webhook por HMAC em `x-fake-signature`.

Producao pode usar `MercadoPagoProvider`:

- `PAYMENT_PROVIDER=mercadopago`
- `PAYMENT_ACCESS_TOKEN=<access token da sua aplicacao Mercado Pago>`
- `PAYMENT_WEBHOOK_SECRET=<secret do webhook Mercado Pago>`
- URL do webhook: `https://SEU_DOMINIO/api/payments/webhook`

Fluxo real:

1. Participante confirma inscricao.
2. Servidor calcula o valor e cria pagamento Pix em `/v1/payments`.
3. Mercado Pago retorna QR Code e Pix copia e cola.
4. Inscricao fica `AGUARDANDO_PAGAMENTO`.
5. Mercado Pago envia webhook quando o pagamento muda.
6. Sistema valida `x-signature` e consulta o pagamento na API.
7. Somente status `approved` vira `PAGO`.
8. Somente `PAGO` confirma a inscricao e reserva oficialmente a vaga.

Pix agendado, pendente, em processamento, rejeitado ou expirado nao confirma inscricao.

## Pix manual com conciliacao PDF

Quando o objetivo e evitar gateway pago, use este modo em producao:

- `PAYMENT_PROVIDER=manualpix`
- `PIX_KEY=<sua chave Pix>`
- `PIX_RECEIVER_NAME=<nome do recebedor>`
- `PIX_RECEIVER_CITY=TAPEJARA`

Fluxo:

1. Sistema gera QR Code Pix com valor exato da inscricao.
2. Participante paga manualmente para a chave Pix configurada.
3. A tela instrui o participante a informar o nome completo na descricao/identificacao do Pix.
4. Inscricao permanece `AGUARDANDO_PAGAMENTO`.
5. Administrador exporta PDF de extrato/comprovantes no banco e importa em `/admin/pagamentos`.
6. Sistema extrai o texto do PDF e gera uma chave unica por valor + descricao normalizada.
7. Sistema ignora transacoes ja importadas anteriormente.
8. Sistema compara valor recebido e nome/descricao do PDF com inscricoes pendentes.
9. Quando bater valor e nome, pagamento vira `PAGO` e inscricao vira `CONFIRMADA`.

Esse modo nao confirma Pix agendado antes da compensacao, porque ele depende da transacao ja aparecer no PDF do banco.

Se no futuro quiser confirmacao automatica por webhook, a producao exigira:

- `PAYMENT_PROVIDER=mercadopago` ou outro provider implementado.
- `PAYMENT_ACCESS_TOKEN`.
- `PAYMENT_WEBHOOK_SECRET`.
- Webhook configurado para `/api/payments/webhook`.
- Teste sandbox antes da virada para producao.
