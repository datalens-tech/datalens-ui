import util from 'util';

import {cloneDeepWith} from 'lodash';

const MAX_LOGS_ROWS = 1000;

export type LogItem = {
    type: string;
    value: string;
};

export class Console {
    private logs: LogItem[][];
    private isScreenshoter: boolean;
    constructor(settings: {isScreenshoter?: boolean} = {}) {
        this.logs = [];
        this.isScreenshoter = Boolean(settings.isScreenshoter);
    }

    log(...args: unknown[]) {
        if (this.isScreenshoter) {
            return;
        }
        if (this.logs.length >= MAX_LOGS_ROWS) {
            return;
        }
        const rowLogs: LogItem[] = [];

        args.forEach((input) => {
            const linkSet = new Set();

            function customCloneAnalyze(value: unknown) {
                const complex = value !== null && typeof value === 'object';

                if (complex && linkSet.has(value)) {
                    return '[Circular]';
                }

                if (complex) {
                    linkSet.add(value);
                }

                if (value instanceof Set || value instanceof Map) {
                    return util.inspect(value);
                }

                if (typeof value === 'undefined') {
                    return '[undefined]';
                }

                return undefined;
            }

            rowLogs.push({
                type: typeof input,
                value: cloneDeepWith(input, customCloneAnalyze),
            });
        });

        this.logs.push(rowLogs);
    }

    getLogs() {
        if (this.logs.length >= MAX_LOGS_ROWS) {
            this.logs.push([
                {
                    type: 'string',
                    value: 'Too much logs',
                },
            ]);
        }

        try {
            JSON.stringify(this.logs);
            return this.logs;
        } catch (e) {
            return [
                [
                    {
                        type: 'string',
                        value: (e as Error).message,
                    },
                ],
            ];
        }
    }
}
