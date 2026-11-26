import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

export function createDistServer() {
  if (!fs.existsSync(distDir)) {
    throw new Error(`Missing dist/ directory at ${distDir}. Run npm run build first.`);
  }

  return http.createServer((req, res) => {
    const rawUrl = req.url || '/';
    const reqPath = decodeURIComponent(rawUrl.split('?')[0]);
    const clean = reqPath.replace(/^\/+/, '');
    const safeClean = path.normalize(clean).replace(/^(\.\.(\/|\\|$))+/, '');

    const fileTarget = path.join(distDir, safeClean);
    if (safeClean && fs.existsSync(fileTarget) && fs.statSync(fileTarget).isFile()) {
      const ext = path.extname(fileTarget).toLowerCase();
      res.writeHead(200, {'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'});
      fs.createReadStream(fileTarget).pipe(res);
      return;
    }

    const routeHtml =
      reqPath === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, safeClean, 'index.html');

    if (fs.existsSync(routeHtml) && fs.statSync(routeHtml).isFile()) {
      res.writeHead(200, {'Content-Type': MIME_TYPES['.html']});
      fs.createReadStream(routeHtml).pipe(res);
      return;
    }

    const notFoundHtml = path.join(distDir, '404.html');
    res.writeHead(404, {'Content-Type': MIME_TYPES['.html']});
    fs.createReadStream(notFoundHtml).pipe(res);
  });
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const port = Number(process.argv[2] || process.env.PORT || 4173);
  const server = createDistServer();
  server.listen(port, '127.0.0.1', () => {
    console.log(`Serving dist/ strictly on http://127.0.0.1:${port}`);
  });
}
