import fs from 'fs';
import http from 'http';

import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({});

const port = process.env?.['LOCAL_DEV_PORT'];

http.createServer((req, res) => {
    const socketPath = req.url?.startsWith('/build')
        ? './dist/run/client.sock'
        : './dist/run/server.sock';

    if (fs.existsSync(socketPath)) {
        proxy.web(req, res, {
            // @ts-ignore
            target: {
                socketPath,
            },
        });
    } else {
        res.writeHead(500);
        res.write('Socket file missing');
        res.end();
    }
}).listen(port);
