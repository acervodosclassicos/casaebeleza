import { firebaseAdmin, paidStatus } from '../_lib/nexum.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  try {
    const expectedToken = process.env.NEXUM_WEBHOOK_TOKEN;
    if (!expectedToken) {
      console.error('NEXUM_WEBHOOK_TOKEN não configurado; webhook recusado.');
      return res.status(503).json({ error: 'Webhook não configurado.' });
    }
    if (req.headers['x-webhook-token'] !== expectedToken) {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    const payload = req.body || {};
    if (payload.event !== 'pix.status_changed' || !payload.tx_id) {
      return res.status(400).json({ error: 'Evento Pix inválido.' });
    }

    const admin = firebaseAdmin();
    const db = admin.firestore();
    const matches = await db.collection('orders').where('nexumTxId', '==', String(payload.tx_id)).limit(1).get();
    if (matches.empty) return res.status(404).json({ error: 'Pedido não localizado para esta transação.' });

    const orderDoc = matches.docs[0];
    const order = orderDoc.data();
    const status = String(payload.status || payload.transaction?.status || 'UNKNOWN').toUpperCase();
    const paidSignal = payload.paid === true || paidStatus(status);
    const transactionAmount = payload.transaction?.amount;
    const amountMatches = transactionAmount == null || (Number.isFinite(Number(transactionAmount)) && Math.abs(Number(transactionAmount) - Number(order.total)) <= 0.01);
    const externalReference = payload.transaction?.external_reference;
    const referenceMatches = !externalReference || String(externalReference) === String(order.orderNumber || order.id);

    if (paidSignal && (!amountMatches || !referenceMatches)) {
      console.error('Nexum webhook validation mismatch:', {
        orderId: orderDoc.id,
        expectedAmount: order.total,
        receivedAmount: transactionAmount,
        expectedReference: order.orderNumber || order.id,
        receivedReference: externalReference,
        txId: payload.tx_id,
      });
      // Responde 200 para não provocar reenvios de um evento que requer análise manual.
      await orderDoc.ref.update({
        nexumStatus: 'REVIEW_REQUIRED',
        paymentReviewRequired: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ received: true, reviewed: true });
    }

    const updates = {
      nexumStatus: status,
      paymentStatus: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (paidSignal) {
      updates.status = 'pagamento_aprovado';
      updates.paymentStatus = 'PAID';
      updates.paidAt = admin.firestore.FieldValue.serverTimestamp();
      updates.paymentReviewRequired = false;
    }

    await orderDoc.ref.update(updates);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Nexum webhook:', error);
    return res.status(500).json({ error: 'Falha ao processar webhook.' });
  }
}
