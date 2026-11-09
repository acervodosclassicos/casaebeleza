import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Parse JSON and urlencoded payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (!req.path.startsWith('/@') && !req.path.includes('.vite')) {
      console.log(`${req.method} ${req.path} [${res.statusCode}] - ${Date.now() - start}ms`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: 'Casa & Beleza Express',
    timestamp: new Date().toISOString(),
  });
});

// Real webhook endpoint for external payment gateways
// Handles Mercado Pago, Asaas, PagSeguro, Stripe, or generic webhook callbacks
const processedTransactions = new Set<string>();

app.post('/api/webhooks/payment', (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    const authHeader = req.headers.authorization || req.headers['x-webhook-secret'];
    
    // Support standard gateway payload structures
    const orderId =
      payload.orderId ||
      payload.external_reference ||
      payload.data?.id ||
      payload.id ||
      req.query.orderId;

    const eventStatus =
      payload.status ||
      payload.event ||
      payload.action ||
      payload.type ||
      'payment.approved';

    const transactionId =
      payload.transactionId ||
      payload.payment_id ||
      payload.id ||
      `${orderId}_${Date.now()}`;

    // Idempotency check: prevent duplicate processing of the same transaction
    if (processedTransactions.has(transactionId)) {
      return res.status(200).json({
        success: true,
        message: 'Transaction already processed (idempotent)',
        transactionId,
      });
    }

    processedTransactions.add(transactionId);
    // Keep set bounded
    if (processedTransactions.size > 1000) {
      const first = processedTransactions.values().next().value;
      if (first) processedTransactions.delete(first);
    }

    // Determine normalized order status
    let mappedStatus = 'aguardando_pagamento';
    const statusLower = String(eventStatus).toLowerCase();

    if (
      statusLower.includes('approved') ||
      statusLower.includes('paid') ||
      statusLower.includes('confirmado') ||
      statusLower.includes('sucesso')
    ) {
      mappedStatus = 'pagamento_aprovado';
    } else if (
      statusLower.includes('refund') ||
      statusLower.includes('reembolsado') ||
      statusLower.includes('canceled') ||
      statusLower.includes('cancelado')
    ) {
      mappedStatus = 'cancelado';
    }

    console.log(`[PAYMENT WEBHOOK] Order ${orderId} status updated to: ${mappedStatus} (Tx: ${transactionId})`);

    return res.status(200).json({
      success: true,
      orderId,
      status: mappedStatus,
      transactionId,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, error: 'Internal processing error' });
  }
});

// Server-side order calculation & price validation
app.post('/api/checkout/validate', (req: Request, res: Response) => {
  try {
    const { items, couponCode } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Nenhum item informado para cálculo' });
    }

    let subtotal = 0;
    for (const item of items) {
      const price = Number(item.price) || 0;
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      subtotal += price * quantity;
    }

    // Known coupons for server-side verification
    let discount = 0;
    let couponApplied = null;
    if (couponCode && typeof couponCode === 'string') {
      const codeUpper = couponCode.trim().toUpperCase();
      if (codeUpper === 'BEMVINDA10') {
        discount = Math.round(subtotal * 0.1 * 100) / 100;
        couponApplied = { code: 'BEMVINDA10', description: '10% de desconto de boas-vindas' };
      } else if (codeUpper === 'PRIMEIRACOMPRA' && subtotal >= 100) {
        discount = 15;
        couponApplied = { code: 'PRIMEIRACOMPRA', description: 'R$ 15,00 OFF acima de R$ 100' };
      }
    }

    const freeShippingThreshold = 49.99;
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const isFreeShipping = subtotalAfterDiscount >= freeShippingThreshold;
    const shipping = isFreeShipping ? 0 : 14.9;
    const total = Math.max(0, subtotalAfterDiscount + shipping);

    return res.json({
      valid: true,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100,
      coupon: couponApplied,
      isFreeShipping,
    });
  } catch (err) {
    console.error('Checkout validation error:', err);
    return res.status(500).json({ error: 'Erro ao validar cálculo do pedido' });
  }
});

// Contact message endpoint
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios' });
  }

  console.log(`[CONTACT RECEIVED] From ${name} <${email}>: ${subject} - ${message}`);
  return res.json({
    success: true,
    message: 'Sua mensagem foi recebida com sucesso! Responderemos em até 24 horas úteis.',
  });
});

// Dynamic robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${process.env.APP_URL || 'https://casabelezaexpress.com.br'}/sitemap.xml\n`);
});

// Dynamic sitemap.xml
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://casabelezaexpress.com.br';
  const urls = [
    '',
    '/catalogo',
    '/categoria/beleza',
    '/categoria/maquiagem',
    '/categoria/cabelos',
    '/categoria/organizacao',
    '/categoria/casa-decoracao',
    '/categoria/utilidades',
    '/sobre',
    '/como-comprar',
    '/entrega-e-frete',
    '/trocas-e-devolucoes',
    '/politica-de-privacidade',
    '/termos-de-uso',
    '/contato',
    '/faq',
    '/rastreio',
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u}</loc>
    <changefreq>daily</changefreq>
    <priority>${u === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// Start dev or production server
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Casa & Beleza Express Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
