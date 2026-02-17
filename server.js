const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Explicitly define the directory to handle potential CWD mismatches on Hostinger
const dir = path.join(__dirname);
const app = next({ dev, hostname, port, dir });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });

    // Important for handling keep-alive timeouts on Load Balancers (like Hostinger/LiteSpeed)
    server.keepAliveTimeout = 61 * 1000;
    server.headersTimeout = 62 * 1000;
});
