import {EDITOR_TYPE} from '../../../../../../shared/constants';

export const validDataChunks: {data: Record<string, unknown>; type: string}[] = [
    // GRAPH_NODE
    {
        data: {
            graph: {},
            js: {},
            params: {},
            shared: {},
            statface_graph: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.GRAPH_NODE,
    },
    {
        data: {
            graph: {},
            js: {},
            meta: {},
            params: {},
            shared: {},
            statface_graph: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.GRAPH_NODE,
    },
    {
        data: {
            graph: {},
            js: {},
            params: {},
            secrets: {},
            shared: {},
            statface_graph: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.GRAPH_NODE,
    },
    {
        data: {
            graph: {},
            js: {},
            meta: {},
            params: {},
            secrets: {},
            shared: {},
            statface_graph: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.GRAPH_NODE,
    },
    // METRIC_NODE
    {
        data: {
            js: {},
            params: {},
            shared: {},
            statface_metric: {},
            url: {},
        },
        type: EDITOR_TYPE.METRIC_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            shared: {},
            statface_metric: {},
            url: {},
        },
        type: EDITOR_TYPE.METRIC_NODE,
    },
    {
        data: {
            js: {},
            params: {},
            secrets: {},
            shared: {},
            statface_metric: {},
            url: {},
        },
        type: EDITOR_TYPE.METRIC_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            secrets: {},
            shared: {},
            statface_metric: {},
            url: {},
        },
        type: EDITOR_TYPE.METRIC_NODE,
    },
    // TABLE_NODE
    {
        data: {
            js: {},
            params: {},
            shared: {},
            table: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.TABLE_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            shared: {},
            table: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.TABLE_NODE,
    },
    {
        data: {
            js: {},
            params: {},
            secrets: {},
            shared: {},
            table: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.TABLE_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            secrets: {},
            shared: {},
            table: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.TABLE_NODE,
    },
    // YMAP_NODE
    {
        data: {
            js: {},
            params: {},
            shared: {},
            url: {},
            ymap: {},
        },
        type: EDITOR_TYPE.YMAP_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            shared: {},
            url: {},
            ymap: {},
        },
        type: EDITOR_TYPE.YMAP_NODE,
    },
    {
        data: {
            js: {},
            params: {},
            secrets: {},
            shared: {},
            url: {},
            ymap: {},
        },
        type: EDITOR_TYPE.YMAP_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            secrets: {},
            shared: {},
            url: {},
            ymap: {},
        },
        type: EDITOR_TYPE.YMAP_NODE,
    },
    // CONTROL_NODE
    {
        data: {
            js: {},
            params: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.CONTROL_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.CONTROL_NODE,
    },
    {
        data: {
            js: {},
            params: {},
            secrets: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.CONTROL_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            secrets: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.CONTROL_NODE,
    },
    // MARKDOWN_NODE
    {
        data: {
            js: {},
            params: {},
            shared: {},
            url: {},
        },
        type: EDITOR_TYPE.MARKDOWN_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            shared: {},
            url: {},
        },
        type: EDITOR_TYPE.MARKDOWN_NODE,
    },
    {
        data: {
            js: {},
            params: {},
            secrets: {},
            shared: {},
            url: {},
        },
        type: EDITOR_TYPE.MARKDOWN_NODE,
    },
    {
        data: {
            js: {},
            meta: {},
            params: {},
            secrets: {},
            shared: {},
            url: {},
        },
        type: EDITOR_TYPE.MARKDOWN_NODE,
    },
    // MARKUP_NODE
    {
        data: {
            config: {},
            js: {},
            params: {},
            shared: {},
            url: {},
        },
        type: EDITOR_TYPE.MARKUP_NODE,
    },
    {
        data: {
            config: {},
            js: {},
            meta: {},
            params: {},
            shared: {},
            url: {},
        },
        type: EDITOR_TYPE.MARKUP_NODE,
    },
    {
        data: {
            config: {},
            js: {},
            params: {},
            secrets: {},
            shared: {},
            url: {},
        },
        type: EDITOR_TYPE.MARKUP_NODE,
    },
    {
        data: {
            config: {},
            js: {},
            meta: {},
            params: {},
            secrets: {},
            shared: {},
            url: {},
        },
        type: EDITOR_TYPE.MARKUP_NODE,
    },
    // MODULE
    {
        data: {documentation_en: {}, documentation_ru: {}, js: {}},
        type: EDITOR_TYPE.MODULE,
    },
    {
        data: {documentation_en: {}, js: {}},
        type: EDITOR_TYPE.MODULE,
    },
    {
        data: {documentation_ru: {}, js: {}},
        type: EDITOR_TYPE.MODULE,
    },
    {
        data: {js: {}},
        type: EDITOR_TYPE.MODULE,
    },
    // D3_NODE
    {
        data: {
            config: {},
            js: {},
            params: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.D3_NODE,
    },
    {
        data: {
            config: {},
            js: {},
            meta: {},
            params: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.D3_NODE,
    },
    {
        data: {
            config: {},
            js: {},
            params: {},
            secrets: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.D3_NODE,
    },
    {
        data: {
            config: {},
            js: {},
            meta: {},
            params: {},
            secrets: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.D3_NODE,
    },
    // BLANK_CHART_NODE
    {
        data: {
            config: {},
            js: {},
            params: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.BLANK_CHART_NODE,
    },
    {
        data: {
            config: {},
            js: {},
            meta: {},
            params: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.BLANK_CHART_NODE,
    },
    {
        data: {
            config: {},
            js: {},
            params: {},
            secrets: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.BLANK_CHART_NODE,
    },
    {
        data: {
            config: {},
            js: {},
            meta: {},
            params: {},
            secrets: {},
            shared: {},
            ui: {},
            url: {},
        },
        type: EDITOR_TYPE.BLANK_CHART_NODE,
    },
];
