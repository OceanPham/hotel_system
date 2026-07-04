import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const browserDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../dist/angular-basic-project/browser',
);
const csrIndex = join(browserDir, 'index.csr.html');
const spaIndex = join(browserDir, 'index.html');

if (existsSync(csrIndex)) {
  copyFileSync(csrIndex, spaIndex);
  console.log('Created index.html from index.csr.html for Vercel SPA routing');
}
