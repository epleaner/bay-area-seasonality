import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const project = dirname(fileURLToPath(import.meta.url));
const source = join(project, '..');
const output = join(project, 'dist');

rmSync(output, { recursive: true, force: true });
mkdirSync(join(output, 'data'), { recursive: true });
for (const file of ['index.html', 'app.js', 'styles.css', 'sw.js', 'manifest.webmanifest', 'icon.svg', 'data/produce.json']) {
  copyFileSync(join(source, file), join(output, file));
}
copyFileSync(join(project, '_headers'), join(output, '_headers'));
