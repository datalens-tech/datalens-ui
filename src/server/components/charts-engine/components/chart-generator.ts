import type {Request} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';

import type {FeatureConfig, StringParams, ValueOf} from '../../../../shared';

const commonTemplateGraph = `
const {buildHighchartsConfig, buildLibraryConfig} = require('#module');

const buildFn = typeof buildLibraryConfig === 'function' ? buildLibraryConfig : buildHighchartsConfig;

const result = buildFn({
    shared: Editor.getSharedData(),
    params: Editor.getParams(),
    actionParams: Editor.getActionParams(),
    widgetConfig: Editor.getWidgetConfig(),
    Editor
});

// your code here

module.exports = result;
`;

const commonTemplateD3Graph = `
const {buildD3Config} = require('#module');

const result = buildD3Config({
    shared: Editor.getSharedData(),
    params: Editor.getParams(),
    actionParams: Editor.getActionParams(),
    widgetConfig: Editor.getWidgetConfig(),
    Editor
});

// your code here

module.exports = result;
`;

const commonTemplate = {
    prepare: `
const {buildGraph} = require('#module');

const result = buildGraph({
    apiVersion: '#apiVersion',
    data: Editor.getLoadedData(),
    shared: Editor.getSharedData(),
    params: Editor.getParams(),
    actionParams: Editor.getActionParams(),
    widgetConfig: Editor.getWidgetConfig(),
    Editor,
});

// your code here

module.exports = result;
`,
    params: `
const {buildParams} = require('#module');

if (buildParams) {
    const result = buildParams({
        shared: Editor.getSharedData(),
        Editor
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
    shared: Editor.getSharedData(),
    params: Editor.getParams(),
    actionParams: Editor.getActionParams(),
    widgetConfig: Editor.getWidgetConfig(),
    Editor
});

// your code here

module.exports = result;
`,
    controls: `
const {buildUI} = require('#module');

if (buildUI) {
    const result = buildUI({
        shared: Editor.getSharedData(),
        params: Editor.getParams(),
        actionParams: Editor.getActionParams(),
        widgetConfig: Editor.getWidgetConfig(),
        Editor
    });

    // your code here

    module.exports = result;
}
`,
    sources: `
const {buildSources} = require('#module');

const result = buildSources({
    apiVersion: '#apiVersion',
    shared: Editor.getSharedData(),
    params: Editor.getParams(),
    Editor
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
    identifyChartType: (data: unknown, req: Request, features?: FeatureConfig) => string;
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

function createChartManifest(args: {links?: Record<string, string>}) {
    const manifest = {
        links: Object.values(args.links ?? {}),
    };

    return JSON.stringify(manifest, null, 4);
}

function getChartTemplate(ctx: AppContext, chartOldType?: string, template?: keyof ChartTemplates) {
    const config = ctx.config;
    const chartTemplates = config.chartTemplates as ChartTemplates;

    if (!template && chartOldType && chartOldType in chartTemplates) {
        template = chartOldType as keyof ChartTemplates;
    }

    const chartTemplate = template && chartTemplates[template];

    if (!chartTemplate) {
        throw new Error('Unknown chart template');
    }

    return chartTemplate;
}

export const chartGenerator = {
    gatherChartLinks: (options: {
        req: Request;
        shared: {type?: string};
        chartTemplate: ValueOf<ChartTemplates>;
    }) => {
        const {req, shared, chartTemplate} = options;

        let links;

        if (chartTemplate.identifyLinks) {
            links = chartTemplate.identifyLinks(shared, req);
        }

        return links;
    },
    serializeShared: (options: {
        ctx: AppContext;
        shared: {type?: string};
        links: Record<string, string> | undefined;
    }) => {
        const {ctx, shared, links} = options;
        const output: {
            shared: string;
            meta?: string;
        } = {
            shared: '',
        };

        try {
            output.shared = JSON.stringify(shared, null, 4);
        } catch (e) {
            throw new Error('Invalid chart data');
        }

        const isEnabledServerFeature = ctx.get('isEnabledServerFeature');
        if (isEnabledServerFeature('EnableChartEditorMetaTab')) {
            output.meta = createChartManifest({links});
        }

        return output;
    },
    identifyChartTemplate: (options: {
        ctx: AppContext;
        shared: {type?: string};
        template?: keyof ChartTemplates;
    }) => {
        const {shared, ctx, template} = options;

        const chartTemplate = getChartTemplate(ctx, shared.type, template);

        if (!chartTemplate) {
            throw new Error('Invalid chart data type');
        }

        return {
            type: shared.type as string,
            chartTemplate,
        };
    },
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
        const chart: Chart = {...commonTemplate};

        const {chartTemplate} = chartGenerator.identifyChartTemplate({ctx, shared: data, template});

        const params = chartTemplate.identifyParams(data, req);
        const type = chartTemplate.identifyChartType(data, req);

        const links = chartGenerator.gatherChartLinks({req, shared: data, chartTemplate});
        const serializedData = chartGenerator.serializeShared({ctx, shared: data, links});

        chart.shared = serializedData.shared;

        if (serializedData.meta) {
            chart.meta = serializedData.meta;
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

        const chartsWithConfig = isD3Graph || isTable;
        const {config: _, ...chartWithoutConfig} = chart;

        return {chart: chartsWithConfig ? chart : chartWithoutConfig, links, type};
    },
};
