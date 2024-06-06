import get from 'lodash/get';
import type {TableRow, TableWidgetEventScope} from 'shared';
import {ChartKitCustomError} from 'ui/libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';

import type {TableWidget} from '../../../../../../types';

const AVAILABLE_TABLE_CLICK_SCOPES: TableWidgetEventScope[] = ['row', 'cell'];

function validateConfigEvents(events?: NonNullable<TableWidget['config']>['events']) {
    if (!events?.click) {
        return;
    }

    const normalizedEvents = Array.isArray(events?.click) ? events?.click : [events?.click];

    const handlersCount = normalizedEvents.reduce((result, event) => {
        const normalizedHandlers = Array.isArray(event.handler) ? event.handler : [event.handler];

        if (event.scope && !AVAILABLE_TABLE_CLICK_SCOPES.includes(event.scope)) {
            throw new ChartKitCustomError(null, {
                details: `Unknown clickable scope "${event.scope}"`,
            });
        }

        return (
            result +
            normalizedHandlers.reduce((acc, h) => {
                return acc + (h.type === 'setActionParams' ? 1 : 0);
            }, 0)
        );
    }, 0);

    if (handlersCount > 1) {
        throw new ChartKitCustomError(null, {
            details: `Seems you are trying to define more than one "setActionParams" handler.`,
        });
    }
}

function isContainsActionParamsEvents(events?: NonNullable<TableWidget['config']>['events']) {
    if (!events?.click) {
        return false;
    }

    const normalizedEvents = Array.isArray(events?.click) ? events.click : [events.click];

    return normalizedEvents.some((event) => {
        const normalizedHandlers = Array.isArray(event.handler) ? event.handler : [event.handler];
        return normalizedHandlers.some((handler) => handler.type === 'setActionParams');
    });
}

function validateDataEvents(args: {rows: TableRow[]; hasActionParamsEvents: boolean}) {
    const {rows} = args;

    rows.forEach((row) => {
        if ('cells' in row) {
            row.cells.forEach((cell) => {
                const action = get(cell, 'onClick.action');

                if (action === 'setActionParams') {
                    throw new ChartKitCustomError(null, {
                        details: `
Seems you are trying to define "setActionParams" handler in unsupported way. This property sets according to this type:

{
    config: {
        events?: {
            click?: {
                handler: {
                    type: 'setActionParams'
                };
                scope: 'row';
            };
        };
    };
    data: {
        rows: {
            cells: [{
                ...
                custom: {actionParams: {ParamKey: ParamValue}},
            }]
        }
    };
}`,
                    });
                }
            });
        }
    });
}

export function validateConfigAndData(args: Pick<TableWidget, 'config' | 'data'>) {
    const {config, data} = args;

    if (config?.events?.click) {
        validateConfigEvents(config.events);
    }

    if (data?.rows) {
        const hasActionParamsEvents = isContainsActionParamsEvents(config?.events);
        validateDataEvents({rows: data.rows, hasActionParamsEvents});
    }
}
