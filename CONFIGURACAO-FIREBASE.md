# Configuração necessária no Firebase — Casa & Beleza Express

As alterações no código adicionam login por e-mail/senha e upload de imagens pelo Firebase Storage. Para que essas funções operem no projeto publicado, confira estas configurações no Console do Firebase (`trans-dogfish-9sjh2`):

## 1. Ativar login por e-mail e senha
1. Abra **Authentication → Sign-in method**.
2. Ative **E-mail/senha** e salve.
3. Mantenha o provedor Google ativado se quiser oferecer as duas opções.
4. O cadastro por e-mail envia um link de verificação ao endereço informado.
5. Em **Authentication → Settings → Authorized domains**, inclua o domínio de produção (Vercel ou domínio próprio).
6. Por segurança, o e-mail administrativo principal não pode ser criado pelo cadastro público; entre com Google ou configure a senha dessa conta de forma segura no Firebase.

## 2. Ativar Firebase Storage
1. Abra **Storage** e crie/ative o bucket do projeto.
2. Publique o conteúdo de `storage.rules` deste projeto nas regras do Storage.
3. O upload do painel aceita imagens JPG, PNG, WEBP e GIF de até 5 MB.
4. A regra incluída autoriza gravação apenas para a conta administrativa principal configurada no projeto e com e-mail verificado (`wesleycorreacdm2023@gmail.com`). Se o administrador principal mudar, ajuste o e-mail na regra antes de publicar.

## 3. Conferir Firestore
Publique as regras de `firestore.rules` no banco Firestore usado pelo app (o projeto utiliza um banco nomeado configurado em `firebase-applet-config.json`). A conta administrativa precisa corresponder ao e-mail definido na regra.

## 4. Dados comerciais antes de abrir a loja
O catálogo e os banners de demonstração foram desativados no fallback local para evitar mostrar produtos, avaliações, preços, cupons, telefone ou links de pagamento fictícios. Se uma versão anterior já gravou produtos de demonstração no Firestore, esses registros continuam no banco e precisam ser revisados/removidos manualmente no painel ou no Console. Cadastre produtos reais no painel, adicione imagens, configure um link de pagamento válido por anúncio e preencha os canais de atendimento e redes sociais nas configurações da loja.

O valor de frete abaixo do limite continua dependendo da configuração de frete da loja. Confirme o valor real antes de receber pedidos.

## 5. Pagamento
A loja não cria cobrança PIX/cartão diretamente. Ela encaminha o comprador para o link externo configurado no anúncio. O cliente só deve ser informado de que o pagamento foi aprovado quando o gateway confirmar a transação por um processo confiável (por exemplo, webhook autenticado integrado ao backend).

## 6. Deploy na Vercel
O frontend React/Vite pode ser publicado como site estático, mas `server.ts` é um servidor Express pensado para execução contínua (por exemplo, Cloud Run). A Vercel não executa esse servidor automaticamente só porque o arquivo está no repositório. As rotas `/api/contact`, `/api/checkout/validate` e `/api/webhooks/payment` precisam ser migradas para funções serverless específicas antes de depender delas na Vercel. A validação de checkout e o webhook foram deixados explicitamente desativados até existir integração confiável com o catálogo e com o gateway escolhido.
