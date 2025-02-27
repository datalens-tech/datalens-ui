import {I18n} from 'i18n';
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

// TODO: https://github.com/datalens-tech/datalens-ui/issues/762
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
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
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
                    name: 'Controls',
                    id: 'ui',
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
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.TIMESERIES_NODE]: {
            get name() {
                return i18n('label_yagr');
            },
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
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
                    name: 'Controls',
                    id: 'ui',
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
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.TABLE_NODE]: {
            get name() {
                return i18n('label_table');
            },
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.TABLE,
                        },
                        docsVendor,
                    ],
                },
                {
                    name: 'Controls',
                    id: 'ui',
                    language: 'javascript',
                    docs: docsControls,
                },
                {
                    name: 'Config',
                    id: 'table',
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
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.TEXT_NODE]: {
            name: 'Текст',
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
                    language: 'javascript',
                },
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
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MARKDOWN,
                        },
                        docsVendor,
                    ],
                },
                ...getSharedTab({docs: docsShare}),
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.METRIC_NODE]: {
            get name() {
                return i18n('label_metric');
            },
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.METRIC,
                        },
                        docsVendor,
                    ],
                },
                {
                    name: 'Config',
                    id: 'statface_metric',
                    language: 'javascript',
                },
                ...getSharedTab({docs: docsShare}),
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.MAP_NODE]: {
            name: 'Карта',
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
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
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.YMAP_NODE]: {
            get name() {
                return i18n('label_yamaps');
            },
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.YANDEX_MAP,
                        },
                        docsVendor,
                    ],
                },
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
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.CONTROL_NODE]: {
            get name() {
                return i18n('label_control');
            },
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                ...(isEnabledFeature('EnableChartEditorControlsJSTab')
                    ? [
                          {
                              name: 'JavaScript',
                              id: 'js',
                              language: 'javascript',
                              docs: docsControls,
                          },
                      ]
                    : []),
                {
                    name: 'Controls',
                    id: 'ui',
                    language: 'javascript',
                    docs: docsControls,
                },
                ...getSharedTab({docs: docsShare}),
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.MODULE]: {
            get name() {
                return i18n('label_module');
            },
            tabs: [
                {
                    name: 'JavaScript',
                    id: 'js',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MODULE,
                        },
                    ],
                },
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
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.MARKUP_NODE]: {
            name: i18n('label_markup'),
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
                    language: 'javascript',
                    docs: [
                        {
                            title: 'section_common-information',
                            path: DOCS_PATH.MARKUP,
                        },
                        docsVendor,
                    ],
                },
                {
                    name: 'Config',
                    id: 'config',
                    language: 'javascript',
                },
                ...getSharedTab({docs: docsShare}),
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.GRAVITY_CHARTS_NODE]: {
            get name() {
                return i18n('label_graph-gravity');
            },
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
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
                    name: 'Controls',
                    id: 'ui',
                    language: 'javascript',
                    docs: docsControls,
                },
                {
                    name: 'Config',
                    id: 'config',
                    language: 'javascript',
                },
                ...getSharedTab({docs: docsShare}),
                ...getMetaTab(),
            ],
        },
        [EDITOR_TYPE.BLANK_CHART_NODE]: {
            get name() {
                //@ts-ignore
                return i18n('label_blank-chart');
            },
            tabs: [
                {
                    name: 'Urls',
                    id: 'url',
                    language: 'javascript',
                    docs: docsUrls,
                },
                {
                    name: 'Params',
                    id: 'params',
                    language: 'javascript',
                    docs: docsParams,
                },
                {
                    name: 'JavaScript',
                    id: 'js',
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
                    name: 'Controls',
                    id: 'ui',
                    language: 'javascript',
                    docs: docsControls,
                },
                {
                    name: 'Config',
                    id: 'config',
                    language: 'javascript',
                },
                ...getSharedTab({docs: docsShare}),
                ...getMetaTab(),
            ],
        },
    } as Record<string, ChartEditorType>;

    if (isEnabledFeature(Feature.ChartActions)) {
        chartEditorTypes[EDITOR_TYPE.CONTROL_NODE].tabs.push({
            name: 'Actions',
            id: 'actions',
            language: 'javascript',
            docs: docsControls,
        });
    }

    return chartEditorTypes[type];
}
