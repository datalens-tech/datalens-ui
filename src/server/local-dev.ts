import fs from 'fs';
import http from 'http';

import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({});

const port = process.env?.['LOCAL_DEV_PORT'];
const devClientPort = process.env?.['DEV_CLIENT_PORT'];
const devServerPort = process.env?.['DEV_SERVER_PORT'];

http.createServer((req, res) => {
    if (devClientPort && devServerPort) {
        const target = req.url?.startsWith('/build')
            ? `http://localhost:${devClientPort}`
            : `http://localhost:${devServerPort}`;

        proxy.web(
            req,
            res,
            {
                // @ts-ignore
                target,
                ws: true,
            },
            (err, _, errRes) => {
                if (err) {
                    errRes.end('Proxy request error: ' + err.message);
                }
            },
        );
    } else {
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
    }
}).listen(port);
