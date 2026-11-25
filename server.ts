import express from 'express';

import type { Request, Response } from 'express';

import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';

import { createServer as createViteServer } from 'vite';


const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


const PORT = Number(process.env.PORT) || 3000;


function isPrivateOrBlockedHost(hostname: string): boolean {

const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');

if (!host) return true;

if (

host === 'localhost'

|| host === '0.0.0.0'

|| host === '::'

|| host === '::1'

|| host.endsWith('.localhost')

|| host.endsWith('.local')

|| host.endsWith('.internal')

) {

return true;

}


// IPv4 private / loopback / link-local ranges

const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

if (ipv4Match) {

const a = Number(ipv4Match[1]);

const b = Number(ipv4Match[2]);

if (a === 10 || a === 127 || a === 0) return true;

if (a === 169 && b === 254) return true;

if (a === 172 && b >= 16 && b <= 31) return true;

if (a === 192 && b === 168) return true;

if (a === 100 && b >= 64 && b <= 127) return true;

}


// IPv6 unique local / link-local / mapped loopback

if (host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('::ffff:127.') || host.startsWith('::ffff:10.') || host.startsWith('::ffff:192.168.')) {

return true;

}


return false;

}


function toProxyPath(rawTarget: string, baseUrl: string): string {

try {

const resolved = new URL(rawTarget.trim(), baseUrl).toString();

return '/api/stream-proxy?url=' + encodeURIComponent(resolved);

} catch {

return rawTarget;

}

}


function rewriteHlsPlaylist(manifestText: string, baseUrl: string): string {

const lines = manifestText.split(/\r?\n/);

const rewritten = lines.map((line) => {

const trimmed = line.trim();

if (!trimmed) return line;

if (trimmed.startsWith('#')) {

return line.replace(/URI="([^"]+)"/gi, (_match, uriVal: string) => {

return `URI="${toProxyPath(uriVal, baseUrl)}"`;

});

}

return toProxyPath(trimmed, baseUrl);

});

return rewritten.join('\n');

}


function sniffBinaryContentType(firstChunk: Uint8Array | null, upstreamType: string, targetUrl: string): string {

const ct = (upstreamType || '').toLowerCase();

const isDisguisedOrGeneric = !ct

|| ct.includes('javascript')

|| ct.includes('ecmascript')

|| ct.includes('text/plain')

|| ct.includes('octet-stream')

|| ct.startsWith('image/');


if (firstChunk && firstChunk.length > 0 && isDisguisedOrGeneric) {

if (firstChunk[0] === 0x47 && (firstChunk.length < 189 || firstChunk[188] === 0x47)) {

return 'video/mp2t';

}

if (firstChunk.length >= 3 && firstChunk[0] === 0x46 && firstChunk[1] === 0x4C && firstChunk[2] === 0x56) {

return 'video/x-flv';

}

if (firstChunk.length >= 8 && firstChunk[4] === 0x66 && firstChunk[5] === 0x74 && firstChunk[6] === 0x79 && firstChunk[7] === 0x70) {

return 'video/mp4';

}

if (firstChunk.length >= 4 && firstChunk[0] === 0x1A && firstChunk[1] === 0x45 && firstChunk[2] === 0xDF && firstChunk[3] === 0xA3) {

return 'video/webm';

}

if (firstChunk.length >= 4 && firstChunk[0] === 0x4F && firstChunk[1] === 0x67 && firstChunk[2] === 0x67 && firstChunk[3] === 0x53) {

return 'video/ogg';

}

}


if (isDisguisedOrGeneric && /\.(ts|m2ts|mts)([?#]|$)/i.test(targetUrl)) {

return 'video/mp2t';

}

return upstreamType || 'application/octet-stream';

}


function setCorsHeaders(res: Response): void {

res.setHeader('Access-Control-Allow-Origin', '*');

res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');

res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Accept-Ranges');

}


async function handleStreamProxy(req: Request, res: Response): Promise<void> {

setCorsHeaders(res);

if (req.method === 'OPTIONS') {

res.status(204).end();

return;

}


const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';

if (!rawUrl) {

res.status(400).json({ error: 'Missing stream url' });

return;

}


let parsedUrl: URL;

try {

parsedUrl = new URL(rawUrl);

} catch {

res.status(400).json({ error: 'Invalid stream url' });

return;

}


if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {

res.status(400).json({ error: 'Unsupported protocol' });

return;

}

if (isPrivateOrBlockedHost(parsedUrl.hostname)) {

res.status(403).json({ error: 'Target host is not allowed' });

return;

}


const abortController = new AbortController();

const connectTimer = setTimeout(() => abortController.abort(), 15000);

let clientClosed = false;

req.on('close', () => {

clientClosed = true;

abortController.abort();

});


try {

const reqHeaders: Record<string, string> = {

'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',

'Accept': '*/*'

};

const rangeHeader = req.headers.range;

if (typeof rangeHeader === 'string' && rangeHeader) {

reqHeaders['Range'] = rangeHeader;

}


const upstream = await fetch(parsedUrl.toString(), {

method: req.method === 'HEAD' ? 'HEAD' : 'GET',

headers: reqHeaders,

redirect: 'follow',

signal: abortController.signal

});

clearTimeout(connectTimer);


const finalUrl = upstream.url || parsedUrl.toString();

try {

const finalParsed = new URL(finalUrl);

if (isPrivateOrBlockedHost(finalParsed.hostname)) {

res.status(403).json({ error: 'Redirect target is not allowed' });

return;

}

} catch {

res.status(400).json({ error: 'Invalid redirect target' });

return;

}


if (!upstream.ok && upstream.status !== 206) {

res.status(upstream.status).send('Upstream error');

return;

}


const upstreamType = upstream.headers.get('content-type') || '';

const ctLow = upstreamType.toLowerCase();

const looksLikeHlsByHeaderOrUrl = ctLow.includes('mpegurl') || /\.m3u8?([?#]|$)/i.test(finalUrl);


if (req.method === 'HEAD' || !upstream.body) {

res.status(upstream.status);

if (upstreamType) res.setHeader('Content-Type', upstreamType);

const len = upstream.headers.get('content-length');

if (len) res.setHeader('Content-Length', len);

const acceptRanges = upstream.headers.get('accept-ranges');

if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

res.end();

return;

}


const reader = upstream.body.getReader();

const firstRead = await reader.read();

const firstChunk = firstRead.value || null;


let startsWithExtml = false;

if (firstChunk && firstChunk.length > 0) {

const preview = new TextDecoder('utf-8', { fatal: false })

.decode(firstChunk.subarray(0, Math.min(firstChunk.length, 64)))

.trimStart();

startsWithExtml = preview.startsWith('#EXTM3U');

}


if (looksLikeHlsByHeaderOrUrl || startsWithExtml) {

const chunks: Uint8Array[] = [];

let totalBytes = 0;

if (firstChunk) {

chunks.push(firstChunk);

totalBytes += firstChunk.byteLength;

}

if (!firstRead.done) {

while (totalBytes < 5 * 1024 * 1024) {

const next = await reader.read();

if (next.done) break;

if (next.value) {

chunks.push(next.value);

totalBytes += next.value.byteLength;

}

}

}

try { await reader.cancel(); } catch {}

if (clientClosed) return;


const combined = Buffer.concat(chunks.map((c) => Buffer.from(c)));

const manifestText = combined.toString('utf8');

const rewritten = rewriteHlsPlaylist(manifestText, finalUrl);

res.status(200);

res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');

res.setHeader('Cache-Control', 'no-store');

res.send(rewritten);

return;

}


// Binary / progressive stream

const resolvedContentType = sniffBinaryContentType(firstChunk, upstreamType, finalUrl);

res.status(upstream.status);

res.setHeader('Content-Type', resolvedContentType);

const contentLength = upstream.headers.get('content-length');

if (contentLength) res.setHeader('Content-Length', contentLength);

const contentRange = upstream.headers.get('content-range');

if (contentRange) res.setHeader('Content-Range', contentRange);

const acceptRanges = upstream.headers.get('accept-ranges');

if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

res.setHeader('Cache-Control', 'no-store');


if (firstChunk && !clientClosed) {

res.write(Buffer.from(firstChunk));

}


if (!firstRead.done && !clientClosed) {

while (!clientClosed) {

const next = await reader.read();

if (next.done) break;

if (next.value && !clientClosed) {

const canContinue = res.write(Buffer.from(next.value));

if (!canContinue) {

await new Promise<void>((resolve) => {

res.once('drain', resolve);

res.once('close', resolve);

});

}

}

}

}

try { await reader.cancel(); } catch {}

if (!res.writableEnded) res.end();

} catch (err) {

clearTimeout(connectTimer);

if (clientClosed || res.headersSent) {

if (!res.writableEnded) res.end();

return;

}

res.status(502).json({ error: 'Stream proxy connection failed' });

}

}


async function startServer(): Promise<void> {

const app = express();

app.disable('x-powered-by');


app.options('/api/stream-proxy', (req: Request, res: Response) => {

setCorsHeaders(res);

res.status(204).end();

});

app.get('/api/stream-proxy', (req: Request, res: Response) => {

void handleStreamProxy(req, res);

});

app.head('/api/stream-proxy', (req: Request, res: Response) => {

void handleStreamProxy(req, res);

});


if (process.env.NODE_ENV === 'production') {

const distDir = path.resolve(__dirname, 'dist');

app.use(express.static(distDir));

app.get('*', (_req: Request, res: Response) => {

const indexFile = path.join(distDir, 'index.html');

if (fs.existsSync(indexFile)) {

res.sendFile(indexFile);

} else {

res.status(404).send('Not found');

}

});

} else {

const vite = await createViteServer({

server: { middlewareMode: true },

appType: 'spa'

});

app.use(vite.middlewares);

}


app.listen(PORT, '0.0.0.0', () => {

console.log(`Server listening on http://0.0.0.0:${PORT}`);

});

}


startServer().catch((err) => {

console.error('Failed to start server:', err);

process.exit(1);

});


