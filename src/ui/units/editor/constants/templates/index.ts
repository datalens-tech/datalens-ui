import control from './control';
import graph from './graph';
import markdown from './markdown';
import metric from './metric';
import module from './module';
import table from './table';
import timeseries from './timeseries';
import yandexMap from './yandex-map';

export const getEditorTemplates = () => {
    return [control, graph, markdown, metric, module, table, timeseries, yandexMap];
};
