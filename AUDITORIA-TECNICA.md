# Auditoria técnica — Casa & Beleza Express

## Correções aplicadas nesta revisão

- A aba **Configurações Gerais da Loja** agora mantém um rascunho controlado dos campos e grava os dados somente ao clicar em **Salvar configurações**.
- WhatsApp, e-mail, CNPJ, endereço comercial, nome da loja, aviso superior e valores de frete são enviados juntos, evitando gravações parciais causadas por vários eventos `onBlur`.
- A gravação do documento `settings/store_config` usa `merge: true`, preservando propriedades adicionais que já existam no documento.
- A inicialização do catálogo foi separada: produtos determinam o fim do carregamento crítico; banners e configurações são carregados em paralelo e não seguram a primeira renderização.
- O documento de configurações recebido do Firestore é mesclado com `INITIAL_SETTINGS`, para manter valores padrão quando documentos antigos não tiverem campos adicionados posteriormente.

## Integração Nexum Pay — implementação server-side para Vercel

- Criadas funções serverless em `api/pix/create.js`, `api/pix/status.js` e `api/pix/webhook.js`.
- A credencial Nexum e a Service Account do Firebase são lidas exclusivamente de variáveis de ambiente do servidor; não são enviadas ao navegador.
- O endpoint de criação valida o pedido existente e confere o valor total antes de solicitar a cobrança Pix.
- O checkout Pix exibe QR Code (quando retornado pela API) e código copia e cola dentro do site.
- O endpoint de status consulta a Nexum e só altera o pedido para `pagamento_aprovado` quando recebe um status final de pagamento confirmado.
- O webhook valida `X-Webhook-Token` quando o segredo está configurado e atualiza o pedido correspondente ao `tx_id`.
- O checkout consulta o status a cada 5 segundos e navega para `/pagamento-confirmado?orderId=...` somente após confirmação.
- O método de pagamento por link externo continua disponível e preservado.

**Configuração obrigatória na Vercel:** `NEXUM_CHAT_ID`, `NEXUM_API_CREDENTIAL`, `NEXUM_WEBHOOK_TOKEN`, `FIREBASE_SERVICE_ACCOUNT` e `APP_URL`. Consulte `CONFIGURACAO-VERCEL-NEXUM.md`. O Chat ID informado na documentação recebida foi `6160000602`; a credencial fixa não foi fornecida e precisa ser gerada no painel Nexum.

## Validação

A revisão foi feita por inspeção estática. O ambiente de execução não concluiu a instalação de dependências, então `npm run build` e `npm run lint` não puderam ser confirmados. A integração depende da configuração dos segredos na Vercel e deve passar por teste real em Preview antes de receber tráfego de produção.
