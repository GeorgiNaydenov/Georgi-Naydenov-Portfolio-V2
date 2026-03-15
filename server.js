/**
 * Local development server for the portfolio.
 * - Strips Jekyll front matter (--- blocks)
 * - Resolves {{ 'path' | relative_url }} Liquid tags to plain paths
 * - Serves binary files (images, fonts) correctly as Buffer, not UTF-8
 * Run:  node server.js
 * Open: http://localhost:4000
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 4000;
const ROOT = __dirname;

const MIME = {
    // Text
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.txt':  'text/plain; charset=utf-8',
    '.xml':  'application/xml; charset=utf-8',
    '.svg':  'image/svg+xml',
    // Binary images — must be sent as Buffer, NOT utf-8 string
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
    '.ico':  'image/x-icon',
    '.avif': 'image/avif',
    // Fonts
    '.woff':  'font/woff',
    '.woff2': 'font/woff2',
    '.ttf':   'font/ttf',
};

// Extensions that should be read as UTF-8 text (everything else → binary Buffer)
const TEXT_EXTS = new Set(['.html', '.js', '.css', '.json', '.txt', '.xml', '.svg']);

// Strip Jekyll front matter ( ---\n...\n--- )
function stripFrontMatter(str) {
    return str.replace(/^---[\s\S]*?---\r?\n/, '');
}

// Replace {{ '/path' | relative_url }} → /path
function resolveRelativeUrls(str) {
    return str.replace(/{{\s*['"]([^'"]+)['"]\s*\|\s*relative_url\s*}}/g, '$1');
}

http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];

    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
    else if (urlPath.endsWith('/'))        urlPath = urlPath.slice(0, -1);

    // Try exact path, then .html, then directory index
    let filePath = path.join(ROOT, urlPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        if (fs.existsSync(filePath + '.html')) {
            filePath = filePath + '.html';
        } else {
            filePath = path.join(ROOT, urlPath, 'index.html');
        }
    }

    if (!fs.existsSync(filePath)) {
        // Silently skip missing favicon.ico — browser falls back to favicon.svg
        if (urlPath === '/favicon.ico') { res.writeHead(204); res.end(); return; }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not found: ' + urlPath);
        return;
    }

    const ext      = path.extname(filePath).toLowerCase();
    const mime     = MIME[ext] || 'application/octet-stream';
    const isText   = TEXT_EXTS.has(ext);

    try {
        if (isText) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (ext === '.html') {
                content = stripFrontMatter(content);
                content = resolveRelativeUrls(content);
            }
            res.writeHead(200, { 'Content-Type': mime });
            res.end(content, 'utf8');
        } else {
            // Binary — read as Buffer, no encoding conversion
            const buffer = fs.readFileSync(filePath);
            res.writeHead(200, {
                'Content-Type': mime,
                'Content-Length': buffer.length
            });
            res.end(buffer);
        }
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(e.message);
    }

}).listen(PORT, () => {
    console.log(`\n  Portfolio dev server → http://localhost:${PORT}\n`);
    console.log('  Press Ctrl+C to stop.\n');
});
