import {isEqual} from 'lodash';

import {EDITOR_TYPE} from '../../../../shared/constants';

// Parts in Set keys should be separeted by comma and defined in alphabetic order
const MODEL_TABS: Record<string, Set<string>> = {
    [EDITOR_TYPE.GRAPH_NODE]: new Set([
        'graph,js,params,shared,statface_graph,ui,url',
        'graph,js,meta,params,shared,statface_graph,ui,url',
        'graph,js,params,secrets,shared,statface_graph,ui,url',
        'graph,js,meta,params,secrets,shared,statface_graph,ui,url',
    ]),

    [EDITOR_TYPE.METRIC_NODE]: new Set([
        'js,params,shared,statface_metric,url',
        'js,meta,params,shared,statface_metric,url',
        'js,params,secrets,shared,statface_metric,url',
        'js,meta,params,secrets,shared,statface_metric,url',
    ]),

    [EDITOR_TYPE.TABLE_NODE]: new Set([
        'js,params,shared,table,ui,url',
        'js,meta,params,shared,table,ui,url',
        'js,params,secrets,shared,table,ui,url',
        'js,meta,params,secrets,shared,table,ui,url',
    ]),

    [EDITOR_TYPE.YMAP_NODE]: new Set([
        'js,params,shared,url,ymap',
        'js,meta,params,shared,url,ymap',
        'js,params,secrets,shared,url,ymap',
        'js,meta,params,secrets,shared,url,ymap',
    ]),

    [EDITOR_TYPE.CONTROL_NODE]: new Set([
        'js,params,shared,ui,url',
        'js,meta,params,shared,ui,url',
        'js,params,secrets,shared,ui,url',
        'js,meta,params,secrets,shared,ui,url',
    ]),

    [EDITOR_TYPE.MARKDOWN_NODE]: new Set([
        'js,params,shared,url',
        'js,meta,params,shared,url',
        'js,params,secrets,shared,url',
        'js,meta,params,secrets,shared,url',
    ]),

    [EDITOR_TYPE.MARKUP_NODE]: new Set([
        'config,js,params,shared,url',
        'config,js,meta,params,shared,url',
        'config,js,params,secrets,shared,url',
        'config,js,meta,params,secrets,shared,url',
    ]),

    [EDITOR_TYPE.MODULE]: new Set([
        'documentation_en,documentation_ru,js',
        'documentation_en,documentation_ru,js,meta',
        'documentation_ru,js',
        'documentation_ru,js,meta',
        'documentation_en,js',
        'documentation_en,js,meta',
        'js',
        'js,meta',
    ]),

    [EDITOR_TYPE.GRAVITY_CHARTS_NODE]: new Set([
        'config,js,params,shared,ui,url',
        'config,js,meta,params,shared,ui,url',
        'config,js,params,secrets,shared,ui,url',
        'config,js,meta,params,secrets,shared,ui,url',
    ]),

    [EDITOR_TYPE.ADVANCED_CHART_NODE]: new Set([
        'config,js,params,shared,ui,url',
        'config,js,meta,params,shared,ui,url',
        'config,js,params,secrets,shared,ui,url',
        'config,js,meta,params,secrets,shared,ui,url',
    ]),
};

MODEL_TABS[EDITOR_TYPE.BLANK_CHART_NODE] = MODEL_TABS[EDITOR_TYPE.ADVANCED_CHART_NODE];

export const chartValidator = {
    validate: ({data, type}: {data: Record<string, unknown>; type: string}) => {
        const dataTabs = Object.keys(data).sort();
        const modelTabs = MODEL_TABS[type as keyof typeof MODEL_TABS];

        if (modelTabs) {
            dataTabs.forEach((key) => {
                if (typeof data[key] !== 'string' && typeof data[key] !== 'object') {
                    throw new Error(`Each tab must have content (failed at tab "${key}")`);
                }
            });

            return Array.from(modelTabs).some((modelTab) => {
                const oldTabs = modelTab.split(',').sort();
                const newTabs = modelTab
                    .replace('js', 'prepare')
                    .replace('ui', 'controls')
                    .replace('url', 'sources')
                    .replace('table', 'config')
                    .split(',')
                    .sort();
                return isEqual(oldTabs, dataTabs) || isEqual(newTabs, dataTabs);
            });
        } else {
            throw new Error(`Unknown chart type "${type}"`);
        }
    },
};
