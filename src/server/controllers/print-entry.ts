
/**
 * Обработчик запроса POST /print-entry - печать графика в PDF
 * 
 * headers: 
 *  x-rpc-authorization: [Токен авторизации]
 * 
 * body:
 * 
{
    "links": ["3rf68dw1mhxoq"],
    "host": "http://localhost:3030",
    "options": {}
    "params": {
        
    }
}
 *
 * где,
 * - links: string[] - массив идентификатор chart'ов, по умолчанию передать только один идентификатор
 * - host: string - текущий хост
 * - options: any - параметры печати PDF https://github.com/puppeteer/puppeteer/blob/main/docs/api/puppeteer.pdfoptions.md
 * - params: any - параметры для чартов, по умолчанию не передавать
 */


import {Request, Response} from '@gravity-ui/expresskit';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as path from 'node:path';
import * as fs from 'node:fs';
import puppeteer from 'puppeteer';

const getChartData = async (host: string, token: string, links: string[], params: any) => {
    let data: any = {};
    for(let i = 0; i < links.length; i++) {
        const link = links[i];

        const axiosInstance = axios.create();
        axiosRetry(axiosInstance, {retries: 3});

        const response = await axiosInstance({
            method: 'post',
            url: `${host}/api/run`,
            headers: {
                'x-rpc-authorization': token
            },
            data: {
                "id": link,
                "params": params || {},
                "responseOptions": {
                    "includeConfig": true,
                    "includeLogs": false
                },
                "workbookId": null
            }
        });

        data[link] = response.data;
    }

    return data;
}

export async function printEntry(req: Request, res: Response) {
    var r: any = req;

    var host = r.body['host'] || 'http://localhost:8080';
    var options = r.body['options'] || {};

    if(r.body['links']) {
        const links = r.body['links'];
        const chartData = await getChartData(host, req.headers['x-rpc-authorization'] as string, links, r.body['params']);

        const filteredLinks = Object.keys(chartData);
        let files = [];
        for(let i = 0; i < filteredLinks.length; i++) {

            const exportPath = path.join(__dirname, '../', '../', '../', 'export');

            if(chartData[filteredLinks[i]].extra.datasets) {
                let sheetName = (chartData[filteredLinks[i]].key.split('/').length > 1 ? chartData[filteredLinks[i]].key.split('/')[1] : filteredLinks[i]) + '-' + Date.now();
                const publicOutputPDFPath = path.join(exportPath, `${sheetName}.pdf`);
                files.push(publicOutputPDFPath);
                // TODO: Try running `which google-chrome-stable` in Docker and using the full path to the binary that is returned.
                
                const _isDevelopment = process.env.APP_ENV === 'development';
                let browser;
                if(_isDevelopment) {
                    browser = await puppeteer.launch();
                } else {
                    browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome-stable'});
                }

                const page = await browser.newPage();
                await page.goto(host + '/preview/' + chartData[filteredLinks[i]].id + '?_embedded=1&_no_controls=1&x-rpc-authorization=' + req.headers['x-rpc-authorization'], {
                    waitUntil: 'networkidle0',
                });
                await page.pdf(Object.assign({
                  path: publicOutputPDFPath,
                  displayHeaderFooter: true,
                  headerTemplate: '',
                  footerTemplate: '',
                  printBackground: true,
                  format: 'A4'
                }, options));
              
                await browser.close();
            }
        }

        const destroy = async () => {
            for(let i = 0; i < files.length; i++) {
                if(fs.existsSync(files[i])) {
                    await fs.promises.unlink(files[i]);
                }
            }
        }

        if (filteredLinks.length == 0) {
            res.status(404).send('Output file is empty');
            return;
        } 

        if(fs.existsSync(files[0])) {
            res.status(200).send(await fs.promises.readFile(files[0]));
        } else {
            res.status(404).send('Output file not found');
        }

        await destroy();
    } else {
        res.status(404).send('Entry ID not found');
    }
}

