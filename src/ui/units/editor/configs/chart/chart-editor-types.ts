import {I18n} from 'i18n';
import sortBy from 'lodash/sortBy';
import {Feature} from 'shared';
import {EDITOR_TYPE} from 'shared/constants';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

const i18n = I18n.keyset('editor.templates.view');

type ChartEditorTab = {
    name: string;
    id: string;
    language: string;
    docs?: {
        title: string;
        path: string;
    }[];
};

export type ChartEditorType = {
    name: string;
    tabs: ChartEditorTab[];
};

function getMetaTab() {
    if (isEnabledFeature('EnableChartEditorMetaTab')) {
        return [
            {
                name: 'Meta',
                id: 'meta',
                language: 'json',
            },
        ];
    }

    return [];
}

type DocsLink = {
    title: string;
    path: string;
}[];

function getSharedTab({docs}: {docs: DocsLink}) {
    if (isEnabledFeature('EnableChartEditorSharedTab')) {
        return [
            {
                name: 'Shared',
                id: 'shared',
                language: 'json',
                docs,
            },
        ];
    }

    return [];
}

function getSourcesTab({docs}: {docs: DocsLink}) {
    const tabName = isEnabledFeature('EditorTabNewNaming') ? 'Sources' : 'Urls';

    return [
        {
            name: tabName,
            id: 'sources',
            language: 'javascript',
            docs,
        },
    ];
}

function getPrepareTab(args?: {docs: DocsLink}) {
    const docs = args?.docs;
    const tabName = isEnabledFeature('EditorTabNewNaming') ? 'Prepare' : 'JavaScript';

    return [
        {
            name: tabName,
            id: 'prepare',
            language: 'javascript',
            docs: docs,
            isMainTab: true,
        },
    ];
}

export function getChartEditorTypes(type: string) {
    const getDocPathPrefix = registry.common.functions.get('getDocPathPrefix');
    const prefix = getDocPathPrefix();

    const DOCS_PATH = {
        MODULE: `${prefix}/editor/modules`,
        SOURCES: `${prefix}/editor/sources/`,
        PARAMS: `${prefix}/editor/params`,
        ARCHITECTURE: `${prefix}/editor/architecture`,
        CONTROLS: `${prefix}/editor/controls/`,
        CHART: `${prefix}/editor/widgets/chart/`,
        TABLE: `${prefix}/editor/widgets/table/`,
        MARKDOWN: `${prefix}/editor/widgets/markdown/`,
        METRIC: `${prefix}/editor/widgets/metric/`,
        MAP: `${prefix}/editor/widgets/map/`,
        YANDEX_MAP: `${prefix}/editor/widgets/yandex-map/`,
        MARKUP: `${prefix}/editor/widgets/markup/`,
    };

    const docsVendor = {
        title: 'section_modules',
        path: DOCS_PATH.MODULE,
    };

    const docsUrls = [
        {
            title: 'section_common-information',
            path: DOCS_PATH.SOURCES,
        },
        docsVendor,
    ];

    const docsParams = [
        {
            title: 'section_common-information',
            path: DOCS_PATH.PARAMS,
        },
        docsVendor,
    ];

    const docsShare = [
        {
            title: 'section_common-information',
            path: DOCS_PATH.ARCHITECTURE,
        },
        docsVendor,
    ];

    const docsControls = [
        {
            title: 'section_common-information',
            path: DOCS_PATH.CONTROLS,
        },
        docsVendor,
    ];

    const chartEditorTypes = {
        [EDITOR_TYPE.GRAPH_NODE]: {
            get name() {
                //@ts-ignore
                return i18n('label_graph');
            },
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.CHART,
                        },
                        docsVendor,
                    ],
                }),
                {
                    name: 'Controls',
                    id: 'controls',
                    language: 'javascript',
                    docs: docsControls,
                },
                {
                    name: 'Highcharts',
                    id: 'graph',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.CHART,
                        },
                        docsVendor,
                    ],
                },
                {
                    name: 'Config',
                    id: 'statface_graph',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.CHART,
                        },
                        docsVendor,
                    ],
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.TIMESERIES_NODE]: {
            get name() {
                return i18n('label_yagr');
            },
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.CHART,
                        },
                        docsVendor,
                    ],
                }),
                {
                    name: 'Controls',
                    id: 'controls',
                    language: 'javascript',
                    docs: docsControls,
                },
                {
                    name: 'Yagr',
                    id: 'graph',
                    language: 'javascript',
                },
                {
                    name: 'Config',
                    id: 'statface_graph',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.CHART,
                        },
                        docsVendor,
                    ],
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.TABLE_NODE]: {
            get name() {
                return i18n('label_table');
            },
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.TABLE,
                        },
                        docsVendor,
                    ],
                }),
                {
                    name: 'Controls',
                    id: 'controls',
                    language: 'javascript',
                    docs: docsControls,
                },
                {
                    name: 'Config',
                    id: 'config',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.TABLE,
                        },
                        docsVendor,
                    ],
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.TEXT_NODE]: {
            name: 'Текст',
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab(),
                {
                    name: 'Config',
                    id: 'statface_text',
                    language: 'javascript',
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.MARKDOWN_NODE]: {
            get name() {
                return i18n('label_markdown');
            },
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MARKDOWN,
                        },
                        docsVendor,
                    ],
                }),
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.METRIC_NODE]: {
            get name() {
                return i18n('label_metric');
            },
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.METRIC,
                        },
                        docsVendor,
                    ],
                }),
                {
                    name: 'Config',
                    id: 'statface_metric',
                    language: 'javascript',
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.MAP_NODE]: {
            name: 'Карта',
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MAP,
                        },
                        docsVendor,
                    ],
                }),
                {
                    name: 'Highmaps',
                    id: 'map',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MAP,
                        },
                        docsVendor,
                    ],
                },
                {
                    name: 'Config',
                    id: 'statface_map',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MAP,
                        },
                        docsVendor,
                    ],
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.YMAP_NODE]: {
            get name() {
                return i18n('label_yamaps');
            },
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.YANDEX_MAP,
                        },
                        docsVendor,
                    ],
                }),
                {
                    name: 'Yandex.Maps',
                    id: 'ymap',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.YANDEX_MAP,
                        },
                        docsVendor,
                    ],
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.CONTROL_NODE]: {
            get name() {
                return i18n('label_control');
            },
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...(isEnabledFeature('EnableChartEditorControlsJSTab')
                    ? [{...getPrepareTab({docs: docsControls})[0], isMainTab: false}]
                    : []),
                {
                    name: 'Controls',
                    id: 'controls',
                    language: 'javascript',
                    docs: docsControls,
                    isMainTab: true,
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.MODULE]: {
            get name() {
                return i18n('label_module');
            },
            tabs: [
                ...getMetaTab(),
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MODULE,
                        },
                    ],
                }),
                {
                    name: 'Doc Ru',
                    id: 'documentation_ru',
                    language: 'markdown',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MODULE,
                        },
                    ],
                },
                {
                    name: 'Doc En',
                    id: 'documentation_en',
                    language: 'markdown',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MODULE,
                        },
                    ],
                },
            ],
        },
        [EDITOR_TYPE.MARKUP_NODE]: {
            name: i18n('label_markup'),
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MARKUP,
                        },
                        docsVendor,
                    ],
                }),
                {
                    name: 'Config',
                    id: 'config',
                    language: 'javascript',
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.GRAVITY_CHARTS_NODE]: {
            get name() {
                return i18n('label_graph-gravity');
            },
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.CHART,
                        },
                        docsVendor,
                    ],
                }),
                {
                    name: 'Controls',
                    id: 'controls',
                    language: 'javascript',
                    docs: docsControls,
                },
                {
                    name: 'Config',
                    id: 'config',
                    language: 'javascript',
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
        [EDITOR_TYPE.ADVANCED_CHART_NODE]: {
            get name() {
                // @ts-ignore
                return i18n('label_advanced-chart');
            },
            tabs: [
                ...getMetaTab(),
                ...getSourcesTab({docs: docsUrls}),
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...getPrepareTab({
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.CHART,
                        },
                        docsVendor,
                    ],
                }),
                {
                    name: 'Controls',
                    id: 'controls',
                    language: 'javascript',
                    docs: docsControls,
                },
                ...getSharedTab({docs: docsShare}),
            ],
        },
    } as Record<string, ChartEditorType>;

    chartEditorTypes[EDITOR_TYPE.BLANK_CHART_NODE] =
        chartEditorTypes[EDITOR_TYPE.ADVANCED_CHART_NODE];

    if (isEnabledFeature(Feature.ChartActions)) {
        chartEditorTypes[EDITOR_TYPE.CONTROL_NODE].tabs.push({
            name: 'Actions',
            id: 'actions',
            language: 'javascript',
            docs: docsControls,
        });
    }

    const order = isEnabledFeature('EditorTabNewOrder')
        ? ['meta', 'shared', 'params', 'sources', 'config', 'prepare', 'controls', 'actions']
        : [];

    chartEditorTypes[type].tabs = sortBy(chartEditorTypes[type].tabs, (tab) =>
        order.indexOf(tab.id),
    );

    return chartEditorTypes[type];
}
