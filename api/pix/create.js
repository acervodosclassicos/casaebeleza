import { firebaseAdmin, nexumHeaders } from '../_lib/nexum.js';

const NEXUM_URL = 'https://nexumpay.squareweb.app';

function cleanName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  try {
    const { orderId } = req.body || {};
    if (typeof orderId !== 'string' || !orderId.trim()) {
      return res.status(400).json({ error: 'ID do pedido não informado.' });
    }

    const admin = firebaseAdmin();
    const db = admin.firestore();
    const orderRef = db.collection('orders').doc(orderId.trim());
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return res.status(404).json({ error: 'Pedido não encontrado.' });

    const order = orderSnap.data();
    const amount = Number(order.total);
    const generatedName = cleanName(order.customerName);
    const generatedEmail = String(order.customerEmail || '').trim();
    const generatedDocument = String(order.customerCpf || '').replace(/\D/g, '');

    // Todos os dados da cobrança vêm do pedido persistido, nunca do valor enviado pelo navegador.
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'O valor total salvo no pedido é inválido.' });
    }
    if (!generatedName || !/^[A-Za-z ]+$/.test(generatedName)) {
      return res.status(400).json({ error: 'O nome do comprador salvo no pedido é inválido para a Nexum.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(generatedEmail)) {
      return res.status(400).json({ error: 'O e-mail salvo no pedido é inválido.' });
    }
    if (generatedDocument.length !== 11) {
      return res.status(400).json({ error: 'O CPF salvo no pedido deve conter 11 números.' });
    }
    if (order.paymentMethod !== 'PIX Nexum') {
      return res.status(409).json({ error: 'Este pedido não foi registrado com a forma de pagamento PIX Nexum.' });
    }
    if (order.status !== 'aguardando_pagamento') {
      return res.status(409).json({ error: 'Este pedido não está aguardando pagamento.' });
    }
    if (order.nexumTxId) {
      return res.status(409).json({ error: 'Este pedido já possui uma cobrança Pix.', tx_id: order.nexumTxId });
    }

    const webhookToken = process.env.NEXUM_WEBHOOK_TOKEN;
    if (!webhookToken) {
      return res.status(503).json({ error: 'Configure NEXUM_WEBHOOK_TOKEN nas variáveis da Vercel antes de gerar cobranças.' });
    }

    const baseUrl = (process.env.APP_URL || `https://${req.headers.host}`).replace(/\/$/, '');
    const response = await fetch(`${NEXUM_URL}/api/public/pix/create`, {
      method: 'POST',
      headers: nexumHeaders(),
      body: JSON.stringify({
        amount,
        generatedName,
        generatedEmail,
        generatedDocument,
        webhook: { url: `${baseUrl}/api/pix/webhook`, token: webhookToken },
        externalReference: String(order.orderNumber || order.id || orderId),
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok || !data.tx_id || !data.qr_code_text) {
      console.error('Nexum create rejected:', { httpStatus: response.status, response: data });
      return res.status(502).json({ error: data.message || data.error || 'A Nexum não conseguiu gerar a cobrança Pix.' });
    }

    // Evita associar uma cobrança cujo valor ou referência retornados não correspondam ao pedido.
    if (data.amount != null && (!Number.isFinite(Number(data.amount)) || Math.abs(Number(data.amount) - amount) > 0.01)) {
      console.error('Nexum amount mismatch:', { orderId, expected: amount, received: data.amount, txId: data.tx_id });
      return res.status(502).json({ error: 'A Nexum retornou um valor diferente do total do pedido. A cobrança não foi vinculada.' });
    }
    if (data.external_reference && String(data.external_reference) !== String(order.orderNumber || order.id || orderId)) {
      return res.status(502).json({ error: 'A referência retornada pela Nexum não corresponde ao pedido.' });
    }

    await orderRef.update({
      paymentMethod: 'PIX Nexum',
      nexumTxId: String(data.tx_id),
      nexumStatus: String(data.status || 'PENDING').toUpperCase(),
      paymentStatus: 'PENDING',
      pixCopyPaste: String(data.qr_code_text),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      tx_id: data.tx_id,
      qr_code_text: data.qr_code_text,
      qr_code_base64: data.qr_code_base64 || null,
      expires_in_seconds: data.expires_in_seconds || 86400,
    });
  } catch (error) {
    console.error('Nexum create:', error);
    return res.status(500).json({ error: 'Não foi possível gerar o Pix. Verifique as configurações do servidor.' });
  }
}
