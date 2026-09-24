import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const templatePath = path.resolve(distDir, 'index.html');
const ssrEntryPath = path.resolve(distDir, 'ssr', 'entry-server.js');

async function prerender() {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at ${templatePath}`);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  const { render } = await import(pathToFileURL(ssrEntryPath).href);
  const appHtml = render();

  const finalHtml = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`
  );

  fs.writeFileSync(templatePath, finalHtml, 'utf-8');
  console.log('✓ Successfully prerendered index.html with static HTML content.');

  fs.rmSync(path.resolve(distDir, 'ssr'), { recursive: true, force: true });
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
