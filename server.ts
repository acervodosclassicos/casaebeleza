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

// Payment webhook placeholder: it refuses events until provider-specific signature validation is implemented.
app.post('/api/webhooks/payment', (req: Request, res: Response) => {
  const configuredSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  const authorization = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const suppliedSecret = authorization || String(req.headers['x-webhook-secret'] || '');

  if (!configuredSecret) {
    return res.status(503).json({
      success: false,
      error: 'Webhook ainda não configurado para um gateway específico.',
    });
  }
  if (!suppliedSecret || suppliedSecret !== configuredSecret) {
    return res.status(401).json({ success: false, error: 'Assinatura do webhook inválida.' });
  }

  // A secret alone does not authenticate a provider event. Implement and verify
  // the selected gateway's signature before changing any order status.
  return res.status(501).json({
    success: false,
    error: 'Validação específica do provedor ainda precisa ser implementada.',
  });
});

// This endpoint remains intentionally unavailable until order prices are
// recalculated from trusted Firestore product records on the server.
app.post('/api/checkout/validate', (_req: Request, res: Response) => {
  return res.status(503).json({
    valid: false,
    error: 'Validação de preços no servidor ainda não foi integrada. Não use valores enviados pelo navegador como fonte confiável.',
  });
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
