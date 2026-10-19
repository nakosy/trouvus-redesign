import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const source = await readFile(new URL('../src/client/site.js', import.meta.url), 'utf8');
const { code } = await transform(source, {
  minify: true,
  target: 'es2020',
  legalComments: 'none',
  banner: '// @ts-nocheck',
});

await mkdir(new URL('../public/scripts/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/scripts/site.js', import.meta.url), code);
console.log(`Client script built (${Buffer.byteLength(code)} bytes).`);
