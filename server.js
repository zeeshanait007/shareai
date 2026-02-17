const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = false;
const port = process.env.PORT || 3000;
const dir = path.join(__dirname);

// DIAGNOSTIC 1: Check if .next folder exists
const nextDir = path.join(dir, '.next');
if (!fs.existsSync(nextDir)) {
    console.error(`CRITICAL: .next directory not found at ${nextDir}`);
    // Start a simple server to report the error to the browser
    createServer((req, res) => {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
            <h1>Deployment Error: Build Missing</h1>
            <p>The <code>.next</code> build directory was not found.</p>
            <p><strong>Path checked:</strong> ${nextDir}</p>
            <hr>
            <h3>How to Fix:</h3>
            <ol>
                <li>Run <code>npm run build</code> in the Hostinger terminal.</li>
                <li>Check for build errors in the console.</li>
            </ol>
        `);
    }).listen(port, () => {
        console.log(`> Diagnostic server ready on port ${port}`);
    });
} else {
    // Normal Next.js startup
    const app = next({ dev, port, dir }); // Removed explicit hostname
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
        const server = createServer(async (req, res) => {
            const startTime = Date.now();

            try {
                // Log request basics
                console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

                const parsedUrl = parse(req.url, true);
                const { pathname } = parsedUrl;

                // DIAGNOSTIC 2: Health check endpoint
                if (pathname === '/health') {
                    res.statusCode = 200;
                    res.end('OK');
                    return;
                }

                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('Error occurred handling', req.url, err);
                res.statusCode = 500;
                res.end('internal server error');
            } finally {
                // Log completion
                const duration = Date.now() - startTime;
                console.log(`[${req.method}] ${req.url} -> ${res.statusCode} (${duration}ms)`);
            }
        });

        server.listen(port, (err) => {
            if (err) throw err;
            console.log(`> Ready on port ${port}`);
        });

        server.keepAliveTimeout = 61 * 1000;
        server.headersTimeout = 62 * 1000;
    }).catch(err => {
        console.error('Next.js failed to start:', err);
        process.exit(1);
    });
}
