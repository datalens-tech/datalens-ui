/* eslint-disable */
'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const https = require('https');
const http = require('http');

// hostname: 'localhost',
// port: 3000,
// path: `/`,
// headers: {
//     'Authorization': `OAuth ${OAUTH_TOKEN}`,
//     'Content-Type': 'application/json',
// },
async function httpGet({protocol, ...options}) {
    return new Promise((resolve, reject) => {
        const request = protocol === 'https' ? https : http;
        const req = request.get(options, (res) => {
            const chunks = [];

            res.on('data', function (chunk) {
                chunks.push(chunk);
            }).on('end', function () {
                let resBody = Buffer.concat(chunks).toString();
                if (res.statusCode === 200 || res.statusCode === 201) {
                    if (res.headers['content-type'].includes('application/json')) {
                        resBody = JSON.parse(resBody);
                    }
                    resolve(resBody);
                } else {
                    reject(new Error(`Status: ${res.statusCode}, ${resBody}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });
    });
}

// hostname: 'localhost,
// port: 3000,
// path: `/`,
// headers: {
//     'Authorization': `OAuth ${OAUTH_TOKEN}`,
//     'Content-Type': 'application/json',
// },
// body: JSON.stringify(data)
async function httpPost({body, protocol, ...options}) {
    return new Promise((resolve, reject) => {
        const request = protocol === 'https' ? https : http;
        const req = request.request(
            {
                method: 'POST',
                ...options,
            },
            (res) => {
                const chunks = [];
                res.on('data', (data) => chunks.push(data));
                res.on('end', () => {
                    let resBody = Buffer.concat(chunks).toString();
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        if (res.headers['content-type'].includes('application/json')) {
                            resBody = JSON.parse(resBody);
                        }
                        resolve(resBody);
                    } else {
                        reject(new Error(`Status: ${res.statusCode}, ${resBody}`));
                    }
                });
            },
        );
        req.on('error', (e) => {
            reject(e);
        });
        if (body) {
            req.write(body);
        }
        req.end();
    });
}

// hostname: 'localhost',
// port: 3000,
// path: `/`,
// headers: {
//     'Authorization': `OAuth ${OAUTH_TOKEN}`,
//     'Content-Type': 'application/json',
// },
async function httpDelete({protocol, ...options}) {
    return new Promise((resolve, reject) => {
        const request = protocol === 'https' ? https : http;
        const req = request.request(
            {
                method: 'DELETE',
                ...options,
            },
            (res) => {
                const chunks = [];
                res.on('data', (data) => chunks.push(data));
                res.on('end', () => {
                    let resBody = Buffer.concat(chunks).toString();
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        if (res.headers['content-type'].includes('application/json')) {
                            resBody = JSON.parse(resBody);
                        }
                        resolve(resBody);
                    } else {
                        reject(new Error(`Status: ${res.statusCode}, ${resBody}`));
                    }
                });
            },
        );

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

module.exports = {
    httpGet,
    httpPost,
    httpDelete,
};
