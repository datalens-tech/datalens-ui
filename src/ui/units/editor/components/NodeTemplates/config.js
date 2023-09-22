import {EditorTemplatesQA} from 'shared/constants/qa/editor';

export const config = {
    templates: {
        'control-10': {
            text: 'Селектор',
            path: 'control',
            qa: EditorTemplatesQA.Selector,
        },
        'graph-10': {
            text: 'График',
            path: 'graph',
            qa: EditorTemplatesQA.Graph,
        },
        'module-10': {
            text: 'Модуль',
            path: 'module',
            qa: EditorTemplatesQA.Module,
        },
        'yandex-map-10': {
            text: 'Яндекс.Карта',
            path: 'yandex-map',
            qa: EditorTemplatesQA.YMap,
        },
        'metric-10': {
            text: 'Показатель',
            path: 'metric',
            qa: EditorTemplatesQA.Metric,
        },
        'table-10': {
            text: 'Таблица',
            path: 'table',
            qa: EditorTemplatesQA.Table,
        },
        'markdown-10': {
            text: 'Markdown',
            path: 'markdown',
            qa: EditorTemplatesQA.Markdown,
        },
        'timeseries-10': {
            text: 'Timeseries',
            path: 'timeseries',
            qa: EditorTemplatesQA.Timeseries,
        },
    },
};
