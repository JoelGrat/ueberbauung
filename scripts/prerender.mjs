import { build } from 'vite';
import { readFileSync, writeFileSync, rmSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// 1. Build the SSR bundle (inherits vite.config.ts plugins automatically)
await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: 'dist-server',
  },
});

// 2. Import and execute the SSR bundle
const entryPath = pathToFileURL(path.resolve(root, 'dist-server/entry-server.js')).href;
const { render } = await import(entryPath);
const appHtml = render();

// 3. Read the client-built index.html
const templatePath = path.resolve(root, 'dist/index.html');
const template = readFileSync(templatePath, 'utf-8');

// 4. Inject pre-rendered HTML into the root div
const html = template.replace(
  '<div id="root"></div>',
  `<div id="root">${appHtml}</div>`,
);

// 5. Write the patched file
writeFileSync(templatePath, html, 'utf-8');

// 6. Remove the temporary SSR build artefacts
rmSync(path.resolve(root, 'dist-server'), { recursive: true, force: true });

console.log('✓ Prerender complete — dist/index.html patched');
