import { readFileSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ID = 'trans-dogfish-9sjh2';
const DATABASE_ID = 'ai-studio-casabelezaexpres-831c228f-bafb-40a7-8718-737c6dab8b2d';
const STORE_NAME = 'Casa & Beleza Express';

type FirestoreValue = Record<string, any>;

function decodeValue(value: FirestoreValue): any {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  return undefined;
}

function decodeFields(fields: Record<string, FirestoreValue>) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char] as string));
}

function cleanDescription(value: unknown): string {
  const plain = String(value ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 190 ? `${plain.slice(0, 187).trimEnd()}...` : plain;
}

function absoluteImage(value: unknown, origin: string): string {
  const candidate = String(value ?? '').trim();
  if (!candidate) return `${origin}/og-casa-beleza.png`;
  try {
    return new URL(candidate, origin).toString();
  } catch {
    return `${origin}/og-casa-beleza.png`;
  }
}

function replaceMeta(html: string, attribute: 'property' | 'name', key: string, content: string) {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${escaped}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `  ${tag}\n  </head>`);
}

function brl(value: unknown): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  const id = String(req.query?.id || '').trim();
  if (!id || id.length > 150 || /[/?#]/.test(id)) {
    return res.status(400).send('Identificador de produto inválido.');
  }

  const origin = `https://${req.headers.host || 'casaebeleza.vercel.app'}`;
  const pageUrl = `${origin}/produto/${encodeURIComponent(id)}`;

  try {
    const documentUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/products/${encodeURIComponent(id)}`;
    const response = await fetch(documentUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      const status = response.status === 404 ? 404 : 502;
      return res.status(status).send(status === 404 ? 'Produto não encontrado.' : 'Não foi possível consultar o produto.');
    }

    const document = await response.json();
    const product = decodeFields(document.fields || {});
    const title = String(product.title || product.name || 'Produto').trim();
    const description = cleanDescription(product.shortDescription || product.description || 'Confira este produto na Casa & Beleza Express.');
    const price = brl(product.price);
    const oldPrice = brl(product.compareAtPrice);
    const priceText = price ? `Preço: ${price}${oldPrice ? ` (antes ${oldPrice})` : ''}. ` : '';
    const socialDescription = cleanDescription(`${priceText}${description}`);
    const images = Array.isArray(product.images) ? product.images : [];
    const image = absoluteImage(images.find((item: unknown) => typeof item === 'string' && item.trim()) || product.thumbnail, origin);
    const fullTitle = `${title} | ${STORE_NAME}`;

    const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    let html = readFileSync(htmlPath, 'utf8');
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
    html = html.replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`);
    html = replaceMeta(html, 'name', 'description', socialDescription);
    html = replaceMeta(html, 'property', 'og:title', fullTitle);
    html = replaceMeta(html, 'property', 'og:description', socialDescription);
    html = replaceMeta(html, 'property', 'og:type', 'product');
    html = replaceMeta(html, 'property', 'og:url', pageUrl);
    html = replaceMeta(html, 'property', 'og:image', image);
    html = replaceMeta(html, 'property', 'og:image:secure_url', image);
    html = replaceMeta(html, 'property', 'og:image:alt', title);
    html = replaceMeta(html, 'property', 'product:price:amount', Number(product.price || 0).toFixed(2));
    html = replaceMeta(html, 'property', 'product:price:currency', 'BRL');
    html = replaceMeta(html, 'name', 'twitter:card', 'summary_large_image');
    html = replaceMeta(html, 'name', 'twitter:title', fullTitle);
    html = replaceMeta(html, 'name', 'twitter:description', socialDescription);
    html = replaceMeta(html, 'name', 'twitter:image', image);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      description,
      image: [image],
      sku: product.sku || undefined,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      offers: Number.isFinite(Number(product.price)) ? {
        '@type': 'Offer',
        priceCurrency: 'BRL',
        price: Number(product.price).toFixed(2),
        availability: Number(product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: pageUrl,
      } : undefined,
    };
    const jsonLd = JSON.stringify(structuredData).replace(/</g, '\\u003c');
    html = html.replace('</head>', `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Open Graph product render failed:', error);
    return res.status(500).send('Erro ao preparar a prévia deste produto.');
  }
}
