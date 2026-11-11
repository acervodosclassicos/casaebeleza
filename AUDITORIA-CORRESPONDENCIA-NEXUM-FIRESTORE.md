# Auditoria de correspondência — Firestore x Nexum Pay

## Estrutura encontrada no projeto

A criação de pedido em `src/context/StoreContext.tsx` grava `orders/{orderId}` usando `setDoc(doc(db, 'orders', orderId), ...)`. O objeto persistido contém `id`, `orderNumber`, `customerName`, `customerEmail`, `customerCpf`, `total`, `status` e `paymentMethod`.

O `orderId` retornado por `createOrder()` é exatamente a chave do documento Firestore (`order_${Date.now()}_...`). O campo `total` é o total calculado no checkout (`cartTotals.total`), não um campo chamado `amount`.

## Mapeamento implementado

| Nexum | Origem canônica no Firestore | Tratamento |
|---|---|---|
| `amount` | `orders/{id}.total` | Convertido para número e validado como positivo; navegador não envia o valor |
| `generatedName` | `customerName` | Remove acentos, números e símbolos conforme documentação Nexum |
| `generatedEmail` | `customerEmail` | Valida formato básico de e-mail |
| `generatedDocument` | `customerCpf` | Remove máscara e exige 11 dígitos |
| `externalReference` | `orderNumber` (fallback `id`) | Reutilizado para conciliação |
| `tx_id` | Resposta Nexum | Salvo em `nexumTxId` |
| `qr_code_text` | Resposta Nexum | Salvo em `pixCopyPaste` |
| status | Resposta Nexum/webhook | Salvo em `nexumStatus` e `paymentStatus` |

## Verificações de confirmação

- O endpoint de status compara o valor devolvido pela Nexum com `orders/{id}.total` antes de aprovar.
- O webhook compara `transaction.amount` e `transaction.external_reference` com o pedido antes de aprovar.
- O webhook exige `NEXUM_WEBHOOK_TOKEN` configurado e confere o header `X-Webhook-Token`.
- O checkout envia somente `orderId`; os dados financeiros e pessoais usados na cobrança são lidos no backend.

## Limites da validação

Esta auditoria é estática do código e da documentação fornecida. Não foram executadas cobranças reais, chamadas autenticadas à conta Nexum nem implantação na Vercel. A confirmação de produção depende das variáveis de ambiente corretas e de um teste controlado de ponta a ponta.
