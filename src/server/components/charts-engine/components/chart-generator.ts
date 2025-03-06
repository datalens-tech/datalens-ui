import type {Request} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';

import {type StringParams, isEnabledServerFeature} from '../../../../shared';

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
    prepare: `
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
    controls: `
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
    sources: `
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
    prepare?: string;
    params: string;
    shared: null | string;
    config: string;
    controls?: string;
    sources?: string;
    table?: string;
    statface_metric?: string;
    graph?: string;
    statface_graph?: string;
    meta?: string;
};

function createChartManifect(args: {links?: Record<string, string>}) {
    const manifest = {
        links: Object.values(args.links ?? {}),
    };

    return JSON.stringify(manifest, null, 4);
}

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
        const isTable = type.indexOf('table') > -1;
        if (type.indexOf('metric') > -1) {
            chart.statface_metric = chart.config.replace('#module', chartTemplate.module);
        } else if (type.indexOf('markup') > -1 || isTable) {
            chart.config = chart.config.replace('#module', chartTemplate.module);
        } else if (isD3Graph) {
            chart.graph = commonTemplateD3Graph.replace('#module', chartTemplate.module);
            chart.config = chart.config.replace('#module', chartTemplate.module);
        } else {
            chart.graph = commonTemplateGraph.replace('#module', chartTemplate.module);

            chart.statface_graph = chart.config.replace('#module', chartTemplate.module);
        }

        chart.prepare = chart.prepare?.replace('#module', chartTemplate.module) ?? '';
        chart.sources = chart.sources?.replace('#module', chartTemplate.module) ?? '';
        chart.controls = chart.controls?.replace('#module', chartTemplate.module);

        const apiVersion = '2';

        chart.prepare = chart.prepare.replace('#apiVersion', apiVersion);
        chart.sources = chart.sources.replace('#apiVersion', apiVersion);

        if (isEnabledServerFeature(ctx, 'EnableChartEditorMetaTab')) {
            chart.meta = createChartManifect({links});
        }

        const chartsWithConfig = isD3Graph || isTable;
        const {config: _, ...chartWithoutCOnfig} = chart;

        return {chart: chartsWithConfig ? chart : chartWithoutCOnfig, links, type};
    },
};
