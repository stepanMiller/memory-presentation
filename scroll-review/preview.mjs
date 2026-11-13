import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const port = Number(process.env.MEMORY_SCROLL_PORT || 4175);
const host = process.env.MEMORY_SCROLL_HOST || '127.0.0.1';
const file = new URL('../output/Memory-Scroll-Review.html', import.meta.url);

createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');
  if (pathname !== '/' && pathname !== '/Memory-Scroll-Review.html') {
    response.writeHead(404).end();
    return;
  }
  try {
    const html = await readFile(file);
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    }).end(html);
  } catch {
    response.writeHead(503).end('Run npm run build:scroll first.');
  }
}).listen(port, host, () => console.log(`Memory scroll review: http://${host}:${port}/`));

