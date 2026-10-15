import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import workspaceApi from '../server/workspaceApi.js';
const root = resolve(process.argv[2] || '.');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2','.json':'application/json'};
const server = http.createServer(async (req,res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if(path.startsWith('/api/')){workspaceApi(req,res);return;}
    if(path.split('/').some(part=>part.startsWith('.')&&part!=='.'))throw new Error('Private path');
    if(!['/','/index.html'].includes(path)&&!path.startsWith('/src/')&&!path.startsWith('/assets/')&&!path.startsWith('/public/assets/'))throw new Error('Not a public asset');
    if(path === '/') path='/index.html';
    let file = resolve(root, '.'+path);
    if(!file.startsWith(root+sep)) throw new Error('Invalid path');
    try { await stat(file); } catch { if(root.endsWith('dist')) throw new Error('Not found'); file=resolve(root,'public','.'+path); }
    res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(await readFile(file));
  } catch { res.writeHead(404);res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173), '0.0.0.0', () => console.log('IFAGRITHM running at http://localhost:'+(process.env.PORT || 4173)));
