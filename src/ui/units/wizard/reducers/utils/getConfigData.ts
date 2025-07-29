import lodash from 'lodash';
import type {ClientChartsConfig, Field, ServerDatasetField, Shared} from 'shared';
import {ChartsConfigVersion, getResultSchemaFromDataset, getSortedData} from 'shared';

import type {ConfigDataState} from '../preview';

export const getConfigData = (state: ConfigDataState): ClientChartsConfig => {
    const datasetsIds: string[] = state.datasets.map((dataset) => dataset.id);
    const datasetsPartialFields: ServerDatasetField[][] = state.datasets.map((dataset) => {
        const schema = getResultSchemaFromDataset(dataset) as Field[];
        return schema.map(
            (field): ServerDatasetField => ({
                guid: field.guid,
                title: field.title,
                calc_mode: field.calc_mode,
            }),
        );
    });

    const unsorteredData: ClientChartsConfig = lodash.cloneDeep({
        colors: state.colors,
        colorsConfig: state.colorsConfig,
        extraSettings: state.extraSettings || {},
        filters: state.filters,
        geopointsConfig: state.geopointsConfig,
        hierarchies: state.hierarchies,
        labels: state.labels,
        links: state.links,
        sort: state.sort,
        tooltips: state.tooltips,
        type: 'datalens',
        updates: state.updates,
        visualization: state.visualization as Shared['visualization'],
        shapes: state.shapes,
        shapesConfig: state.shapesConfig,
        segments: state.segments,
        version: ChartsConfigVersion.V13,
        datasetsIds: datasetsIds,
        datasetsPartialFields: datasetsPartialFields,
    });

    return getSortedData(unsorteredData) as ClientChartsConfig;
};
