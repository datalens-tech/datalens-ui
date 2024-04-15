import {
    AppEnvironment,
    AppInstallation,
    DL_CONTEXT_HEADER,
    Language,
    isTrueArg,
} from '../../../shared';
import {resolveSource} from '../../../shared/endpoints/sources';
import {nativeModules} from '../../components/charts-engine/components/processor/native-modules';
import {SERVICE_NAME_DATALENS} from '../../constants';
import controlDashChartTemplate from '../shared/control-dash-chart-template';
import datalensChartTemplate from '../shared/datalens-chart-template';
import qlChartTemplate from '../shared/ql-chart-template';

export default {
    // DATALENS MODE
    serviceName: SERVICE_NAME_DATALENS,

    csrf: null,

    expressCookieSecret: process.env.COOKIE_SECRET,

    appAuthPolicy: 'redirect',
    authMethods: [],
    runResponseWhitelist: [
        'sourceId',
        'sourceType',
        'body',
        'status',
        'latency',
        'size',
        'data',
        'datasetId',
        'code',
    ],

    regionalEnvConfig: {
        defaultLang: Language.En,
        allowLanguages: [Language.En, Language.Ru],
    },

    csp: 'disabled',

    expressBodyParserRawConfig: {
        type: 'multipart/form-data',
        limit: '21mb',
    },
    usMasterToken: process.env.US_MASTER_TOKEN || 'fake-us-master-token',

    // CHARTS MODE

    allowBodyConfig: true,

    chartTemplates: {
        ql: qlChartTemplate,
        datalens: datalensChartTemplate,
        control_dash: controlDashChartTemplate,
    },

    getSourcesByEnv: (env: AppEnvironment) => {
        const sources = resolveSource(AppInstallation.Opensource, env);

        return {
            bi: {
                dataEndpoint: sources.bi,
                passedCredentials: {},
                description: {
                    title: {
                        ru: 'DataLens BI',
                        en: 'DataLens BI',
                    },
                },
            },
            bi_connections: {
                dataEndpoint: sources.bi_connections,
                passedCredentials: {},
                description: {
                    title: {
                        ru: 'DataLens BI Connections',
                        en: 'DataLens BI Connections',
                    },
                },
            },
            bi_datasets: {
                dataEndpoint: sources.bi_datasets,
                passedCredentials: {},
                description: {
                    title: {
                        ru: 'DataLens BI Datasets',
                        en: 'DataLens BI Datasets',
                    },
                },
            },
            bi_datasets_embed: {
                dataEndpoint: sources.bi_datasets_embed,
                passedCredentials: {},
                description: {
                    title: {
                        ru: 'DataLens BI Datasets Embed',
                        en: 'DataLens BI Datasets Embed',
                    },
                },
            },
            bi_connections_embed: {
                dataEndpoint: sources.bi_connections_embed,
                passedCredentials: {},
                description: {
                    title: {
                        ru: 'DataLens BI Connections Embed',
                        en: 'DataLens BI Connections Embed',
                    },
                },
            },
            us_color_palettes: {
                description: {
                    title: {
                        ru: 'US color palettes',
                        en: 'US color palettes',
                    },
                },
                dataEndpoint: `${process.env.US_ENDPOINT || sources.us}/v1/color-palettes`,
                passedCredentials: {},
            },
        };
    },

    redis: null,

    axiosDefaults: {},

    defaultTenantMode: {
        foldersEnabled: true,
        workbooksEnabled: false,
        collectionsEnabled: false,
    },

    chartsMonitoringEnabled: false,

    iamResources: {
        collection: {
            roles: {
                admin: 'datalens.collections.admin',
                editor: 'datalens.collections.editor',
                viewer: 'datalens.collections.viewer',
                limitedViewer: 'datalens.collections.limitedViewer',
            },
        },
        workbook: {
            roles: {
                admin: 'datalens.workbooks.admin',
                editor: 'datalens.workbooks.editor',
                viewer: 'datalens.workbooks.viewer',
                limitedViewer: 'datalens.workbooks.limitedViewer',
            },
        },
    },

    chartsEngineConfig: {
        nativeModules: nativeModules.BASE_NATIVE_MODULES,
        secrets: {},
        enableTelemetry: true,
        usEndpointPostfix: '',
        dataFetcherProxiedHeaders: [DL_CONTEXT_HEADER],
    },

    chartkitSettings: {
        highcharts: {
            enabled: isTrueArg(process.env.HC),
            external: true,
            domain: 'code.highcharts.com',
            modules: [
                'exporting',
                'export-data',
                'stock',
                'solid-gauge',
                'funnel',
                'histogram-bellcurve',
                'sankey',
                'heatmap',
                'treemap',
                'variwide',
                'streamgraph',
                'drilldown',
                'parallel-coordinates',
                'pattern-fill',
                'wordcloud',
                'xrange',
                'networkgraph',
                'timeline',
                'bullet',
                'annotations',
                'series-label',
                'venn',
            ],
            version: '8.2.2',
        },
        yandexMap: {
            enabled: isTrueArg(process.env.YANDEX_MAP_ENABLED),
        },
    },
};
