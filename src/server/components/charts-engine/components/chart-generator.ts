import type {Request} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';

import type {StringParams} from '../../../../shared';

const commonTemplateGraph = `
const {buildHighchartsConfig, buildLibraryConfig} = require('#module');

const buildFn = typeof buildLibraryConfig === 'function' ? buildLibraryConfig : buildHighchartsConfig;

const result = buildFn({
    shared: ChartEditor.getSharedData(),
    params: ChartEditor.getParams(),
    actionParams: ChartEditor.getActionParams(),
    widgetConfig: ChartEditor.getWidgetConfig(),
    ChartEditor
});

// your code here

module.exports = result;
`;

const commonTemplateD3Graph = `
const {buildD3Config} = require('#module');

const result = buildD3Config({
    shared: ChartEditor.getSharedData(),
    params: ChartEditor.getParams(),
    actionParams: ChartEditor.getActionParams(),
    widgetConfig: ChartEditor.getWidgetConfig(),
    ChartEditor
});

// your code here

module.exports = result;
`;

const commonTemplate = {
    js: `
const {buildGraph} = require('#module');

const result = buildGraph({
    apiVersion: '#apiVersion',
    data: ChartEditor.getLoadedData(),
    shared: ChartEditor.getSharedData(),
    params: ChartEditor.getParams(),
    actionParams: ChartEditor.getActionParams(),
    widgetConfig: ChartEditor.getWidgetConfig(),
    ChartEditor,
});

// your code here

module.exports = result;
`,
    params: `
const {buildParams} = require('#module');

if (buildParams) {
    const result = buildParams({
        shared: ChartEditor.getSharedData(),
        ChartEditor
    });

    // your code here

    module.exports = result;
} else {
    // your code here

    module.exports = #params;
}
`,
    shared: null,
    config: `
const {buildChartsConfig} = require('#module');

const result = buildChartsConfig({
    shared: ChartEditor.getSharedData(),
    params: ChartEditor.getParams(),
    actionParams: ChartEditor.getActionParams(),
    widgetConfig: ChartEditor.getWidgetConfig(),
    ChartEditor
});

// your code here

module.exports = result;
`,
    ui: `
const {buildUI} = require('#module');

if (buildUI) {
    const result = buildUI({
        shared: ChartEditor.getSharedData(),
        params: ChartEditor.getParams(),
        actionParams: ChartEditor.getActionParams(),
        widgetConfig: ChartEditor.getWidgetConfig(),
        ChartEditor
    });

    // your code here

    module.exports = result;
}
`,
    url: `
const {buildSources} = require('#module');

const result = buildSources({
    apiVersion: '#apiVersion',
    shared: ChartEditor.getSharedData(),
    params: ChartEditor.getParams(),
    ChartEditor
});

// your code here

module.exports = result;
`,
};

export type ChartTemplates = {
    datalens: ChartTemplate;
    sql: ChartTemplate;
    ql: ChartTemplate;
    control_dash: ChartTemplate;
    solomon: ChartTemplate;
    legacy_wizard: ChartTemplate;
};

type ChartTemplate = {
    module: string;
    identifyParams: (data: unknown, req: Request) => StringParams;
    identifyChartType: (data: unknown, req: Request) => string;
    identifyLinks: (data: unknown, req: Request) => Record<string, string>;
};

type Chart = {
    js: string;
    params: string;
    shared: null | string;
    config: string;
    ui: string;
    url: string;
    table?: string;
    statface_metric?: string;
    graph?: string;
    statface_graph?: string;
};

export const chartGenerator = {
    generateChart: ({
        data,
        template,
        req,
        ctx,
    }: {
        data: {type?: string};
        template?: keyof ChartTemplates;
        req: Request;
        ctx: AppContext;
    }) => {
        const config = ctx.config;
        const chartTemplates = config.chartTemplates as ChartTemplates;
        const chart: Chart = {...commonTemplate};

        const chartOldType = data.type;

        if (!template && chartOldType && chartOldType in chartTemplates) {
            template = chartOldType as keyof ChartTemplates;
        }

        const chartTemplate = template && chartTemplates[template];

        if (!chartTemplate) {
            throw new Error('Unknown chart template');
        }

        try {
            chart.shared = JSON.stringify(data, null, 4);
        } catch (e) {
            throw new Error('Invalid chart data');
        }

        const params = chartTemplate.identifyParams(data, req);

        const type = chartTemplate.identifyChartType(data, req);

        let links;
        if (chartTemplate.identifyLinks) {
            links = chartTemplate.identifyLinks(data, req);
        }

        chart.params = chart.params.replace('#params', JSON.stringify(params));
        if (chart.params.indexOf('#module') > -1) {
            chart.params = chart.params.replace('#module', chartTemplate.module);
        }

        const isD3Graph = type.indexOf('d3') > -1;
        if (type.indexOf('table') > -1) {
            chart.table = chart.config.replace('#module', chartTemplate.module);
        } else if (type.indexOf('metric') > -1) {
            chart.statface_metric = chart.config.replace('#module', chartTemplate.module);
        } else if (type.indexOf('markup') > -1) {
            chart.config = chart.config.replace('#module', chartTemplate.module);
        } else if (isD3Graph) {
            chart.graph = commonTemplateD3Graph.replace('#module', chartTemplate.module);
            chart.config = chart.config.replace('#module', chartTemplate.module);
        } else {
            chart.graph = commonTemplateGraph.replace('#module', chartTemplate.module);

            chart.statface_graph = chart.config.replace('#module', chartTemplate.module);
        }

        chart.js = chart.js.replace('#module', chartTemplate.module);
        chart.url = chart.url.replace('#module', chartTemplate.module);
        chart.ui = chart.ui.replace('#module', chartTemplate.module);

        const apiVersion = '2';

        chart.js = chart.js.replace('#apiVersion', apiVersion);
        chart.url = chart.url.replace('#apiVersion', apiVersion);

        const {config: _, ...chartWithoutCOnfig} = chart;

        return {chart: isD3Graph ? chart : chartWithoutCOnfig, links, type};
    },
};
