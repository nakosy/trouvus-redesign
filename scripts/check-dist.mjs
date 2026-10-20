import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';

const root = resolve('dist');
const target = process.env.CHECK_TARGET ?? 'sites';
if (!existsSync(root)) {
  console.error('dist/ does not exist. Run npm run build first.');
  process.exit(1);
}

const walk = (directory) => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

const htmlFiles = walk(root).filter((file) => extname(file) === '.html');
const idsByFile = new Map();
const failures = [];
let referencesChecked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  idsByFile.set(file, new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1])));
  const label = relative(root, file);
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${label}: missing title`);
  if (!/<meta\s+name=["']description["']\s+content=["'][^"']+["']/i.test(html)) failures.push(`${label}: missing meta description`);
  if (!/<link\s+rel=["']canonical["']\s+href=["'][^"']+["']/i.test(html)) failures.push(`${label}: missing canonical URL`);
  if ((html.match(/<h1\b/gi) ?? []).length !== 1) failures.push(`${label}: expected exactly one h1`);
}

const notFoundPath = join(root, '404.html');
if (!existsSync(notFoundPath)) failures.push('404.html: missing branded not-found page');
else if (!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(readFileSync(notFoundPath, 'utf8'))) {
  failures.push('404.html: missing noindex robots directive');
}

const sitemapAliasPath = join(root, 'sitemap.xml');
if (!existsSync(sitemapAliasPath)) failures.push('sitemap.xml: missing conventional sitemap endpoint');
else if (!/<sitemapindex\b/i.test(readFileSync(sitemapAliasPath, 'utf8'))) {
  failures.push('sitemap.xml: expected a sitemap index');
}

if (target === 'netlify') {
  const staticHeadersPath = join(root, '_headers');
  if (!existsSync(staticHeadersPath)) failures.push('_headers: missing Netlify static security policy');
  else if (!readFileSync(staticHeadersPath, 'utf8').includes('Content-Security-Policy')) {
    failures.push('_headers: missing content security policy');
  }
  const contactPath = join(root, 'contact', 'index.html');
  if (!existsSync(contactPath) || !readFileSync(contactPath, 'utf8').includes('data-netlify="true"')) {
    failures.push('contact/index.html: missing Netlify form declaration');
  }
  if (!existsSync(resolve('netlify.toml'))) failures.push('netlify.toml: missing deployment configuration');
} else {
  const workerPath = join(root, 'server', 'index.js');
  if (!existsSync(workerPath)) failures.push('server/index.js: missing Sites worker');
  else {
    const worker = readFileSync(workerPath, 'utf8');
    if (!worker.includes('Content-Security-Policy')) failures.push('server/index.js: missing security headers');
    if (!worker.includes('X-Robots-Tag')) failures.push('server/index.js: missing 404 noindex header');
  }

  const staticHeadersPath = join(root, 'client', '_headers');
  if (!existsSync(staticHeadersPath)) failures.push('client/_headers: missing static-host security policy');
  else if (!readFileSync(staticHeadersPath, 'utf8').includes('Content-Security-Policy')) {
    failures.push('client/_headers: missing content security policy');
  }
}

const resolveTarget = (fromFile, rawReference) => {
  const reference = rawReference.replace(/&amp;/g, '&');
  if (!reference || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(reference)) return null;
  const [pathAndQuery, hash = ''] = reference.split('#');
  const pathPart = pathAndQuery.split('?')[0];
  let target;
  if (!pathPart) target = fromFile;
  else if (pathPart.startsWith('/')) target = join(root, pathPart);
  else target = resolve(dirname(fromFile), pathPart);

  if (target.endsWith('/') || (!extname(target) && !existsSync(target))) target = join(target, 'index.html');
  else if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
  return { target: normalize(target), hash: decodeURIComponent(hash) };
};

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const references = [...html.matchAll(/\s(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const reference of references) {
    const resolved = resolveTarget(file, reference);
    if (!resolved) continue;
    referencesChecked += 1;
    if (!resolved.target.startsWith(root)) {
      failures.push(`${relative(root, file)}: reference escapes dist (${reference})`);
      continue;
    }
    if (!existsSync(resolved.target)) {
      failures.push(`${relative(root, file)}: missing target ${reference}`);
      continue;
    }
    if (resolved.hash && extname(resolved.target) === '.html') {
      const ids = idsByFile.get(resolved.target) ?? new Set([...readFileSync(resolved.target, 'utf8').matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]));
      if (!ids.has(resolved.hash)) failures.push(`${relative(root, file)}: missing anchor ${reference}`);
    }
  }
}

if (failures.length) {
  console.error(`Static verification failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Static verification passed: ${htmlFiles.length} HTML pages and ${referencesChecked} local references checked.`);
