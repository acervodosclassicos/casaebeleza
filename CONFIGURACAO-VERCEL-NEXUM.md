# Deploy na Vercel — Nexum Pay

## Variáveis de ambiente
No projeto da Vercel, abra **Settings → Environment Variables** e cadastre, em Production (e Preview se desejar):

- `NEXUM_CHAT_ID`: Chat ID da conta Nexum.
- `NEXUM_API_CREDENTIAL`: credencial fixa criada no painel Nexum em Integração.
- `NEXUM_WEBHOOK_TOKEN`: segredo aleatório longo para autenticar o webhook.
- `FIREBASE_SERVICE_ACCOUNT`: JSON completo da Service Account do Firebase, em uma única linha.
- `APP_URL`: URL pública canônica do site, por exemplo `https://seudominio.com.br` (sem barra final).

**Nunca** coloque `NEXUM_API_CREDENTIAL` ou a Service Account em variáveis `VITE_*`, no código React ou em arquivos públicos. Se alguma credencial já foi publicada, revogue e gere outra.

## Firebase Admin
No Firebase Console → Configurações do projeto → Contas de serviço, gere uma chave privada para uma conta de serviço dedicada. Guarde o JSON apenas na variável `FIREBASE_SERVICE_ACCOUNT` da Vercel. Conceda somente as permissões necessárias para ler e atualizar documentos de pedidos no Firestore.

## Webhook Nexum
A URL de webhook é criada pelo backend como `https://seudominio.com.br/api/pix/webhook`. O token configurado em `NEXUM_WEBHOOK_TOKEN` é enviado no campo `webhook.token` e validado no header `X-Webhook-Token`.

## Fluxo implementado
1. O checkout grava o pedido no Firestore.
2. `/api/pix/create` valida o valor contra o pedido salvo e cria a cobrança Nexum.
3. O QR Code e o Pix copia e cola são exibidos dentro do checkout.
4. `/api/pix/status` consulta o status diretamente na Nexum; quando pago, atualiza o pedido para `pagamento_aprovado`.
5. O webhook também atualiza o pedido, permitindo confirmação mesmo sem o navegador aberto.
6. O checkout consulta o status a cada 5 segundos e redireciona para `/pagamento-confirmado?orderId=...` quando a Nexum confirmar.

## Antes de publicar
- Cadastre todas as variáveis acima na Vercel e faça um novo Deploy.
- Teste em Preview com cobrança de baixo valor real e confira criação, QR, cópia, webhook, consulta de status e redirecionamento.
- Confirme no Firebase que o pedido muda para `pagamento_aprovado` somente após status pago.
- Verifique os logs das Functions `/api/pix/create`, `/api/pix/status` e `/api/pix/webhook`.

As chaves reais não foram incluídas neste ZIP. A integração não deve ser considerada validada em produção até os testes acima serem concluídos com credenciais reais.
