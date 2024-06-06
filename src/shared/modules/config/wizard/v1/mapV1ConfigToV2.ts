import type {Dataset, GraphShared, ServerDatasetField, Shared} from '../../../../index';
import {ChartsConfigVersion} from '../../../../index';
import type {V2ChartsConfig} from '../../../../types';

export const mapV1ConfigToV2 = (config: Shared): V2ChartsConfig => {
    let datasetsPartialFields: ServerDatasetField[][];
    let datasets: Dataset[];
    if (!config.datasets) {
        datasets = [config.dataset!];
        datasetsPartialFields = [[...(config.dimensions || []), ...(config.measures || [])]];
    } else {
        datasets = config.datasets || [];
        datasetsPartialFields = (config.datasets || []).map((dataset) => {
            const schema = dataset.result_schema || dataset.dataset.result_schema || [];
            return schema.map(
                (field): ServerDatasetField => ({
                    guid: field.guid,
                    title: field.title,
                }),
            );
        });
    }
    const datasetsIds: string[] = (config.datasets || datasets).map((dataset) => dataset.id);
    const v2Config: V2ChartsConfig = {
        title: config.title || '',
        colors: config.colors || [],
        colorsConfig: config.colorsConfig || {},
        extraSettings: config.extraSettings || {},
        filters: config.filters || [],
        geopointsConfig: (config as GraphShared).geopointsConfig || {},
        hierarchies: config.hierarchies || [],
        labels: config.labels || [],
        links: config.links || [],
        sort: config.sort || [],
        tooltips: config.tooltips || [],
        type: 'datalens',
        updates: config.updates || [],
        visualization: config.visualization as V2ChartsConfig['visualization'],
        shapes: config.shapes || [],
        shapesConfig: (config as GraphShared).shapesConfig || {},
        version: ChartsConfigVersion.V2,
        datasetsIds,
        datasetsPartialFields,
    };

    return v2Config;
};
