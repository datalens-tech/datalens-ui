import type {Palette, ServerPlaceholder, V4Field} from '../../../../../../shared';
import {DATASET_FIELD_TYPES} from '../../../../../../shared';
import {
    CHARTS_MIDDLEWARE_URL_TYPE,
    REQUEST_WITH_DATASET_SOURCE_NAME,
} from '../../constants/middleware-urls';
import {getColorPalettesRequests} from '../../helpers/color-palettes';
import {getDatasetIdAndLayerIdRequestKey} from '../../helpers/misc';
import {mapChartsConfigToServerConfig} from '../utils/config-helpers';
import {DATASET_DATA_PIVOT_URL, DATASET_DATA_URL_V1, DATASET_DATA_URL_V2} from '../utils/constants';
import {getAllPlaceholderItems, log} from '../utils/misc-helpers';

import {prepareFieldsForPayload} from './helpers';
import type {
    PrepareSingleSourceRequestArgs,
    PrepareSourceRequestBody,
    PrepareSourceRequestsArgs,
    SourceRequest,
    SourceRequests,
    SourcesArgs,
} from './types';

const getAllPlaceholdersItemsForSourceRequest = (placeholders: ServerPlaceholder[]) => {
    const placeholdersItems = getAllPlaceholderItems(placeholders);

    return placeholdersItems.reduce((acc, field) => {
        if (field.data_type === DATASET_FIELD_TYPES.HIERARCHY) {
            const items = field.fields || [];
            return [...acc, ...items];
        }
        return [...acc, field];
    }, [] as V4Field[]);
};

const prepareSourceRequestBody = (args: PrepareSourceRequestBody): SourceRequest => {
    const {sourceArgs, isPivotRequest, datasetId, apiVersion} = args;

    let url;
    if (isPivotRequest) {
        url = DATASET_DATA_PIVOT_URL.replace('{id}', datasetId);
    } else if (apiVersion === '2') {
        url = DATASET_DATA_URL_V2.replace('{id}', datasetId);
    } else {
        url = DATASET_DATA_URL_V1.replace('{id}', datasetId);
    }

    return {
        url,
        middlewareUrl: {
            sourceName: REQUEST_WITH_DATASET_SOURCE_NAME,
            middlewareType: CHARTS_MIDDLEWARE_URL_TYPE,
        },
        method: 'POST',
        sourceArgs,
    };
};

const prepareSingleSourceRequest = (args: PrepareSingleSourceRequestArgs): SourceRequests => {
    const {
        placeholders,
        datasetsIds,
        apiVersion,
        layerId = '',
        sourceArgs,
        isPivotRequest,
        links,
    } = args;

    const placeholdersItems = getAllPlaceholdersItemsForSourceRequest(placeholders);

    return datasetsIds.reduce((acc, datasetId: string) => {
        const payloadFields = prepareFieldsForPayload(placeholdersItems, datasetId, links);

        // If there are no fields that are necessary for visualization, then we do not request anything at all
        if (!payloadFields.length) {
            return acc;
        }

        const key = getDatasetIdAndLayerIdRequestKey(datasetId, layerId);

        return {
            ...acc,
            [key]: prepareSourceRequestBody({apiVersion, sourceArgs, isPivotRequest, datasetId}),
        };
    }, {} as SourceRequests);
};

const prepareSourceRequests = (args: PrepareSourceRequestsArgs): SourceRequests => {
    const {datasetsIds, visualization, apiVersion, sourceArgs, extraSettings, links} = args;

    const isVisualizationWithLayers =
        visualization.id === 'geolayer' || visualization.id === 'combined-chart';

    const pivotFallbackEnabled = extraSettings?.pivotFallback === 'on';

    const isPivotRequest = Boolean(visualization.id === 'pivotTable' && !pivotFallbackEnabled);

    if (isVisualizationWithLayers) {
        const layers = visualization.layers || [];
        return layers.reduce((acc, layer) => {
            const {placeholders} = layer;

            const request = prepareSingleSourceRequest({
                placeholders,
                apiVersion,
                datasetsIds,
                sourceArgs,
                isPivotRequest,
                layerId: layer.layerSettings.id,
                links,
            });

            return {
                ...acc,
                ...request,
            };
        }, {} as SourceRequests);
    } else {
        const placeholders = visualization.placeholders;
        return prepareSingleSourceRequest({
            placeholders,
            apiVersion,
            datasetsIds,
            sourceArgs,
            isPivotRequest,
        });
    }
};

export const buildSourcesPrivate = (
    args: SourcesArgs & {palettes: Record<string, Palette>},
): SourceRequests => {
    const {shared, palettes} = args;
    const apiVersion = args.apiVersion || '1.5';

    const config = mapChartsConfigToServerConfig(shared);

    shared.sharedData = config.sharedData;
    shared.links = config.links;

    const visualization = config.visualization;
    const datasetsIds = config.datasetsIds;
    const extraSettings = config.extraSettings;

    const requests = prepareSourceRequests({
        apiVersion,
        visualization,
        datasetsIds,
        extraSettings,
        sourceArgs: args,
        links: config.links,
    });

    Object.assign(requests, getColorPalettesRequests({config, palettes}));

    log('SOURCE REQUESTS:');
    log(requests);

    return requests;
};
