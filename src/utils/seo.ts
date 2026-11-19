export interface SeoPayload {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  image?: string;
  robots?: string;
  publishedTime?: string;
  section?: string;
  jsonLd?: Record<string, unknown>;
}

const DEFAULT_OG_IMAGE =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png';

export function toAbsoluteUrl(urlOrPath?: string): string {
  const origin = window.location.origin;
  const candidate = (urlOrPath || '').trim();
  if (!candidate) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return `${origin}${candidate.startsWith('/') ? '' : '/'}${candidate}`;
}

function upsertMeta(attrName: 'name' | 'property', attrValue: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attrName}="${attrValue}"]`
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(attrName: 'name' | 'property', attrValue: string): void {
  const el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (el) el.remove();
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function applyPageSeo(payload: SeoPayload): void {
  const canonicalUrl = `${window.location.origin}${payload.path}`;
  const ogImage = toAbsoluteUrl(payload.image);
  const ogType = payload.type || 'website';

  document.title = payload.title;
  upsertMeta('name', 'description', payload.description);
  upsertMeta(
    'name',
    'robots',
    payload.robots ||
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  );
  upsertLink('canonical', canonicalUrl);

  upsertMeta('property', 'og:locale', 'id_ID');
  upsertMeta('property', 'og:site_name', 'P2B UIN Salatiga');
  upsertMeta('property', 'og:type', ogType);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:title', payload.title);
  upsertMeta('property', 'og:description', payload.description);
  upsertMeta('property', 'og:image', ogImage);

  if (ogType === 'article') {
    if (payload.publishedTime) {
      upsertMeta('property', 'article:published_time', payload.publishedTime);
    }
    if (payload.section) {
      upsertMeta('property', 'article:section', payload.section);
    }
  } else {
    removeMeta('property', 'article:published_time');
    removeMeta('property', 'article:section');
  }

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', payload.title);
  upsertMeta('name', 'twitter:description', payload.description);
  upsertMeta('name', 'twitter:image', ogImage);

  const scriptId = 'p2b-dynamic-jsonld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (payload.jsonLd) {
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload.jsonLd);
  } else if (script) {
    script.remove();
  }
}
