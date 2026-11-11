import { firebaseAdmin, nexumHeaders, paidStatus } from '../_lib/nexum.js';

const NEXUM_URL = 'https://nexumpay.squareweb.app';
const FAILED_STATUSES = ['FAILED', 'FAIL', 'ERROR', 'REJECTED', 'REFUNDED', 'CANCELLED', 'CANCELED', 'EXPIRED'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

  try {
    const orderId = typeof req.query?.orderId === 'string' ? req.query.orderId : '';
    if (!orderId) return res.status(400).json({ error: 'Pedido não informado.' });

    const admin = firebaseAdmin();
    const db = admin.firestore();
    const orderRef = db.collection('orders').doc(orderId);
    const snap = await orderRef.get();
    if (!snap.exists) return res.status(404).json({ error: 'Pedido não encontrado.' });

    const order = snap.data();
    if (!order.nexumTxId) return res.status(404).json({ error: 'Cobrança Pix não encontrada.' });

    const response = await fetch(`${NEXUM_URL}/api/public/pix/status/${encodeURIComponent(order.nexumTxId)}`, {
      headers: nexumHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) return res.status(502).json({ error: 'Não foi possível consultar o pagamento na Nexum.' });

    const status = String(data.status || 'UNKNOWN').toUpperCase();
    const amountMatches = data.amount == null || (Number.isFinite(Number(data.amount)) && Math.abs(Number(data.amount) - Number(order.total)) <= 0.01);
    if (paidStatus(status) && !amountMatches) {
      console.error('Nexum status amount mismatch:', { orderId, orderTotal: order.total, nexumAmount: data.amount, txId: order.nexumTxId });
      return res.status(409).json({ status: 'REVIEW_REQUIRED', paid: false, error: 'O valor confirmado pela Nexum diverge do total do pedido. A confirmação automática foi bloqueada.' });
    }

    const updates = {
      nexumStatus: status,
      paymentStatus: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (paidStatus(status)) {
      updates.status = 'pagamento_aprovado';
      updates.paymentStatus = 'PAID';
      updates.paidAt = admin.firestore.FieldValue.serverTimestamp();
    }
    await orderRef.update(updates);

    return res.status(200).json({ status, paid: paidStatus(status) });
  } catch (error) {
    console.error('Nexum status:', error);
    return res.status(500).json({ error: 'Erro ao consultar o pagamento.' });
  }
}
