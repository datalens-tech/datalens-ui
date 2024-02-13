import {EditorTemplatesQA} from '../../../../../shared/constants/qa/editor';

export const config: {templates: Record<string, Record<string, string>>} = {
    templates: {
        control: {
            text: 'Селектор',
            path: 'control',
            qa: EditorTemplatesQA.Selector,
        },
        graph: {
            text: 'График',
            path: 'graph',
            qa: EditorTemplatesQA.Graph,
        },
        module: {
            text: 'Модуль',
            path: 'module',
            qa: EditorTemplatesQA.Module,
        },
        'yandex-map': {
            text: 'Яндекс.Карта',
            path: 'yandex-map',
            qa: EditorTemplatesQA.YMap,
        },
        metric: {
            text: 'Показатель',
            path: 'metric',
            qa: EditorTemplatesQA.Metric,
        },
        table: {
            text: 'Таблица',
            path: 'table',
            qa: EditorTemplatesQA.Table,
        },
        markdown: {
            text: 'Markdown',
            path: 'markdown',
            qa: EditorTemplatesQA.Markdown,
        },
        markup: {
            text: 'Markup',
            path: 'markup',
            qa: EditorTemplatesQA.Markup,
        },
        timeseries: {
            text: 'Timeseries',
            path: 'timeseries',
            qa: EditorTemplatesQA.Timeseries,
        },
    },
};
