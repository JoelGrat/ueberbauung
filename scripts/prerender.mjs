import { build } from 'vite';
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'fs';
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

// 5b. Teilbare Seite für den 3D-Rundgang: /3d-rundgang liefert dieselbe App
//     (öffnet den Rundgang per URL) mit eigenem Titel und eigener Link-Vorschau.
const TOUR_TITLE = '3D-Rundgang Widematte – Musterwohnung 3.2 in Nesselnbach';
const TOUR_DESC =
  'Virtueller 360°-Panoramarundgang durch die 4.5-Zimmer-Musterwohnung 3.2 der Neubau-Überbauung Widematte in Nesselnbach (AG).';
const TOUR_URL_ABS = 'https://widematte.ch/3d-rundgang';
const TOUR_IMAGE = 'https://widematte.ch/Images/Innenansicht/Geb3_OG_Livingroom.jpg';

// Ersetzt den Wert eines <meta>-Tags, unabhängig von der Attribut-Reihenfolge/-Ausrichtung
const metaPattern = (attr, value) =>
  new RegExp('(<meta ' + attr + '="' + value + '"[^>]*content=")[^"]*');
const keepPrefix = (value) => (_m, prefix) => prefix + value;

const tourReplacements = [
  [new RegExp('(<title>)[^<]*(</title>)'), (_m, p1, p2) => p1 + TOUR_TITLE + p2],
  [metaPattern('name', 'description'), keepPrefix(TOUR_DESC)],
  [metaPattern('property', 'og:url'), keepPrefix(TOUR_URL_ABS)],
  [metaPattern('property', 'og:title'), keepPrefix(TOUR_TITLE)],
  [metaPattern('property', 'og:description'), keepPrefix(TOUR_DESC)],
  [metaPattern('property', 'og:image'), keepPrefix(TOUR_IMAGE)],
  [metaPattern('name', 'twitter:title'), keepPrefix(TOUR_TITLE)],
  [metaPattern('name', 'twitter:description'), keepPrefix(TOUR_DESC)],
  [metaPattern('name', 'twitter:image'), keepPrefix(TOUR_IMAGE)],
  [new RegExp('(<link rel="canonical" href=")[^"]*'), keepPrefix(TOUR_URL_ABS)],
];

let tourHtml = html;
for (const [pattern, replacement] of tourReplacements) {
  if (!pattern.test(tourHtml)) {
    throw new Error(`Prerender: Muster für die 3D-Rundgang-Seite nicht gefunden: ${pattern}`);
  }
  tourHtml = tourHtml.replace(pattern, replacement);
}

const tourDir = path.resolve(root, 'dist/3d-rundgang');
mkdirSync(tourDir, { recursive: true });
writeFileSync(path.resolve(tourDir, 'index.html'), tourHtml, 'utf-8');

// 6. Remove the temporary SSR build artefacts
rmSync(path.resolve(root, 'dist-server'), { recursive: true, force: true });

console.log('✓ Prerender complete — dist/index.html patched, dist/3d-rundgang/index.html erstellt');
