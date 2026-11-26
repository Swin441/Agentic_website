import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveSiteUrl} from './site-url.mjs';
import {prerender} from './prerender.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

async function main() {
  process.env.NODE_ENV = 'production';
  const siteOrigin = resolveSiteUrl();

  const runVite = (args) => {
    execFileSync(process.execPath, [viteBin, ...args], {
      cwd: rootDir,
      stdio: 'inherit',
      env: {...process.env, NODE_ENV: 'production'},
    });
  };

  runVite(['build']);
  runVite(['build', '--ssr', 'src/entry-server.tsx', '--outDir', 'dist-server']);
  await prerender(siteOrigin);
}

main().catch((err) => {
  console.error('Build failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
