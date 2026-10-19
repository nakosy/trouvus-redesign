import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const clientDir = join(distDir, 'client');
const serverDir = join(distDir, 'server');

await rm(clientDir, { recursive: true, force: true });
await mkdir(clientDir, { recursive: true });

for (const entry of await readdir(distDir, { withFileTypes: true })) {
  if (['client', 'server', '.openai'].includes(entry.name)) continue;

  await cp(join(distDir, entry.name), join(clientDir, entry.name), {
    recursive: entry.isDirectory(),
  });
}

await mkdir(serverDir, { recursive: true });
const notFoundHtml = await readFile(join(distDir, '404.html'), 'utf8');
await writeFile(
  join(serverDir, 'index.js'),
  `const notFoundHtml = ${JSON.stringify(notFoundHtml)};

const redirects = new Map(${JSON.stringify([
    ['/index.html', '/'],
    ['/expertise.html', '/expertise/'],
    ['/approach.html', '/approach/'],
    ['/results.html', '/perspectives/'],
    ['/perspectives.html', '/perspectives/'],
    ['/insights.html', '/insights/'],
    ['/about.html', '/about/'],
    ['/contact.html', '/contact/'],
    ['/insight-why-ai-strategies-fail.html', '/insights/why-ai-strategies-fail/'],
    ['/insight-transformation-portfolio.html', '/insights/transformation-portfolio/'],
    ['/insight-cognitive-offloading.html', '/insights/cognitive-offloading/'],
    ['/insight-beyond-cost-reduction.html', '/insights/beyond-cost-reduction/'],
    ['/insight-habmc.html', '/insights/human-augmented-business-model-canvas/'],
    ['/insight-strategy-to-scale.html', '/insights/strategy-to-scale/'],
  ])});

const applyHeaders = (response, pathname, { notFound = false } = {}) => {
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto:; upgrade-insecure-requests");
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  headers.set('Strict-Transport-Security', 'max-age=31536000');

  if (/^\\/(?:_astro|images|og)\\//.test(pathname)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  if (notFound) headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export default {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response('Static asset binding is unavailable.', { status: 503 });
    }

    const url = new URL(request.url);
    const redirectPath = redirects.get(url.pathname);
    if (redirectPath) {
      url.pathname = redirectPath;
      const response = Response.redirect(url, 301);
      return applyHeaders(response, url.pathname);
    }

    let response = await env.ASSETS.fetch(request);

    if (response.status === 404 && ['GET', 'HEAD'].includes(request.method)) {
      const fileName = url.pathname.split('/').pop() || '';
      const hasExtension = fileName.includes('.');

      if (!hasExtension) {
        const indexUrl = new URL(url);
        indexUrl.pathname = url.pathname.endsWith('/')
          ? url.pathname + 'index.html'
          : url.pathname + '/index.html';
        const indexResponse = await env.ASSETS.fetch(new Request(indexUrl, request));

        if (indexResponse.status !== 404) {
          if (!url.pathname.endsWith('/')) {
            url.pathname += '/';
            return applyHeaders(Response.redirect(url, 301), url.pathname);
          }
          response = indexResponse;
        }
      }

      if (response.status === 404) {
        const body = request.method === 'HEAD' ? null : notFoundHtml;
        response = new Response(body, {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
        return applyHeaders(response, url.pathname, { notFound: true });
      }
    }

    return applyHeaders(response, url.pathname);
  },
};
`,
  'utf8',
);
