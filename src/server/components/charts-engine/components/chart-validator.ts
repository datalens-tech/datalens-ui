import {EDITOR_TYPE} from '../../../../shared/constants';

const MODEL_TABS = {
    graph_node: new Set([
        'graph,js,params,shared,statface_graph,ui,url',
        'graph,js,params,secrets,shared,statface_graph,ui,url',
    ]),

    metric_node: new Set([
        'js,params,shared,statface_metric,url',
        'js,params,secrets,shared,statface_metric,url',
    ]),

    table_node: new Set(['js,params,shared,table,ui,url', 'js,params,secrets,shared,table,ui,url']),

    ymap_node: new Set(['js,params,shared,url,ymap', 'js,params,secrets,shared,url,ymap']),

    control_node: new Set(['js,params,shared,ui,url', 'js,params,secrets,shared,ui,url']),

    markdown_node: new Set(['js,params,shared,url', 'js,params,secrets,shared,url']),

    markup_node: new Set(['config,js,params,shared,url', 'config,js,params,secrets,shared,url']),

    module: new Set([
        'documentation_en,documentation_ru,js',
        'documentation_ru,js',
        'documentation_en,js',
        'js',
    ]),

    [EDITOR_TYPE.D3_NODE]: new Set([
        'js,params,shared,ui,url,config',
        'js,params,secrets,shared,ui,url,config',
    ]),

    [EDITOR_TYPE.BLANK_CHART_NODE]: new Set([
        'js,params,shared,ui,url,config',
        'js,params,secrets,shared,ui,url,config',
    ]),
};

export const chartValidator = {
    validate: ({data, type}: {data: Record<string, unknown>; type: string}) => {
        const dataTabs = Object.keys(data).sort();
        const joinedDataTabs = dataTabs.join(',');
        const modelTabs = MODEL_TABS[type as keyof typeof MODEL_TABS];

        if (modelTabs) {
            dataTabs.forEach((key) => {
                if (typeof data[key] !== 'string' && typeof data[key] !== 'object') {
                    throw new Error(`Each tab must have content (failed at tab "${key}")`);
                }
            });

            return modelTabs.has(joinedDataTabs);
        } else {
            throw new Error(`Unknown chart type "${type}"`);
        }
    },
};
