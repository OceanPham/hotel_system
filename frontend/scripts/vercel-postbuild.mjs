import { existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const browserDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../dist/angular-basic-project/browser',
);
const csrIndex = join(browserDir, 'index.csr.html');

if (existsSync(csrIndex)) {
  unlinkSync(csrIndex);
  console.log('Removed index.csr.html for Vercel SSR routing');
}
