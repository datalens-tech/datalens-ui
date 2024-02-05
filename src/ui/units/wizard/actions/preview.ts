import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {batch} from 'react-redux';
import {Dispatch} from 'redux';
import {
    ColorsConfig,
    CommonPlaceholders,
    Dataset,
    Field,
    FilterField,
    HierarchyField,
    Link,
    PointSizeConfig,
    ShapesConfig,
    Shared,
    Sort,
    Update,
    VisualizationWithLayersShared,
    isVisualizationWithLayers,
} from 'shared';
import {DatalensGlobalState} from 'ui';
import {DatasetState} from 'ui/units/wizard/reducers/dataset';
import {VisualizationState} from 'ui/units/wizard/reducers/visualization';
import {WidgetState} from 'ui/units/wizard/reducers/widget';

import {WizardDispatch} from '../reducers';
import {
    actualizeUpdates,
    extractFieldsFromDatasets,
    getAllCommonPlaceholdersFields,
} from '../utils/helpers';

export const UPDATE_PREVIEW = Symbol('wizard/preview/UPDATE_PREVIEW');
export const SET_HIGHCHARTS_WIDGET = Symbol('wizard/preview/SET_HIGHCHARTS_WIDGET');
export const SET_UPDATES = Symbol('wizard/SET_UPDATES');
export const UPDATE_CLIENT_CHARTS_CONFIG = Symbol('wizard/UPDATE_CLIENT_CHARTS_CONFIG');

export interface HighchartsWidget {
    chartWidth: number;
    reflow: () => void;
    setOpacity: (layerId: string, opacity: number) => void;
    series?: Highcharts.Series[];
    userOptions: Highcharts.Options;
}

interface SetHighchartsWidgetAction {
    type: typeof SET_HIGHCHARTS_WIDGET;
    highchartsWidget: HighchartsWidget;
}

export function setHighchartsWidget({highchartsWidget}: {highchartsWidget: HighchartsWidget}) {
    return {
        highchartsWidget,
        type: SET_HIGHCHARTS_WIDGET,
    };
}

interface SetUpdatesAction {
    type: typeof SET_UPDATES;
    updates: Update[];
}

export function setUpdates({updates}: {updates: Update[]}): SetUpdatesAction {
    return {
        type: SET_UPDATES,
        updates,
    };
}

type ActualizeAndSetUpdatesArgs = {
    updates: Update[];
    onUpdateItemsGuids?: string[];
    shouldMergeUpdatesFromState?: boolean;
};

export function actualizeAndSetUpdates({
    updates,
    onUpdateItemsGuids,
    shouldMergeUpdatesFromState,
}: ActualizeAndSetUpdatesArgs) {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const wizardState = getState().wizard;
        const visualizationState = wizardState.visualization;

        const visualization = visualizationState.visualization;
        const datasets = wizardState.dataset.datasets;

        const {colors, shapes, sort, filters, labels, tooltips} = visualizationState;

        const visualizationFields = [
            ...colors,
            ...shapes,
            ...sort,
            ...filters,
            ...labels,
            ...tooltips,
        ] as Field[];

        if (isVisualizationWithLayers(visualization)) {
            const layers = visualization.layers;

            const {commonPlaceholders, placeholders} = layers.reduce(
                (acc, layer) => {
                    return {
                        ...acc,
                        commonPlaceholders: [
                            ...acc.commonPlaceholders,
                            layer.commonPlaceholders as CommonPlaceholders,
                        ],
                        placeholders: [
                            ...acc.placeholders,
                            ...layer.placeholders.reduce(
                                (acc, placeholder) => [...acc, ...(placeholder.items || [])],
                                [] as Field[],
                            ),
                        ],
                    };
                },
                {commonPlaceholders: [], placeholders: []} as {
                    commonPlaceholders: CommonPlaceholders[];
                    placeholders: Field[];
                },
            );

            const fields = getAllCommonPlaceholdersFields(commonPlaceholders);

            visualizationFields.push(...fields, ...placeholders);
        }

        const sectionDatasetFields = extractFieldsFromDatasets(datasets || []);

        const rawUpdates = shouldMergeUpdatesFromState
            ? [...updates, ...wizardState.preview.updates]
            : updates;

        const actualizedUpdates = actualizeUpdates({
            updates: rawUpdates,
            visualization,
            sectionDatasetFields,
            onUpdateItemsGuids,
            visualizationFields,
        });

        dispatch(setUpdates({updates: actualizedUpdates}));
    };
}

type UpdatePreviewAndClientChartsConfigArgs = UpdateClientChartsConfigArgs &
    Pick<UpdatePreviewArgs, 'needRedraw' | 'previewEntryId'>;

const UPDATE_CLIENT_CHARTS_CONFIG_ARGS: Array<keyof UpdateClientChartsConfigArgs> = [
    'isInitialPreview',
    'withoutRerender',
];

export function updatePreviewAndClientChartsConfig(
    preview: UpdatePreviewAndClientChartsConfigArgs,
) {
    return (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const visualizationState = getState().wizard.visualization;
        const datasetState = getState().wizard.dataset;
        const widgetState = getState().wizard.widget;

        const visualizationKeys: Array<keyof VisualizationState> = [
            'colors',
            'colorsConfig',
            'geopointsConfig',
            'filters',
            'labels',
            'sort',
            'tooltips',
            'visualization',
            'hierarchies',
            'shapesConfig',
            'shapes',
            'segments',
        ];

        const datasetKeys: Array<keyof DatasetState> = ['datasets', 'links'];
        const widgetKeys: Array<keyof WidgetState> = ['extraSettings'];

        const updatePreviewArgs = {
            ...omit(preview, UPDATE_CLIENT_CHARTS_CONFIG_ARGS),
            ...pick(visualizationState, visualizationKeys),
            ...pick(datasetState, datasetKeys),
            ...pick(widgetState, widgetKeys),
        };

        const updateClientChartsConfigArgs: UpdateClientChartsConfigArgs = pick(
            preview,
            UPDATE_CLIENT_CHARTS_CONFIG_ARGS,
        );

        batch(() => {
            dispatch(
                _updatePreview({
                    ...updatePreviewArgs,
                }),
            );

            const isRedrawDone = typeof preview.needRedraw === 'undefined' || preview.needRedraw;

            if (isRedrawDone && !preview.previewEntryId) {
                dispatch(updateClientChartsConfig(updateClientChartsConfigArgs));
            }
        });
    };
}

interface UpdatePreviewAction {
    type: typeof UPDATE_PREVIEW;
    preview: UpdatePreviewArgs;
}

export interface UpdatePreviewArgs {
    previewEntryId?: string;
    needRedraw?: boolean;
    colors?: Field[];
    colorsConfig?: ColorsConfig;
    geopointsConfig?: PointSizeConfig;
    datasets?: Dataset[];
    filters?: FilterField[];
    labels?: Field[];
    links?: Link[];
    sort?: Sort[];
    tooltips?: Field[];
    visualization?: Shared['visualization'] | VisualizationWithLayersShared['visualization'];
    extraSettings?: Shared['extraSettings'];
    hierarchies?: HierarchyField[];
    shapes?: Field[];
    shapesConfig?: ShapesConfig;
    segments?: Field[];
}

function _updatePreview(preview: UpdatePreviewArgs): UpdatePreviewAction {
    return {
        preview,
        type: UPDATE_PREVIEW,
    };
}

type UpdateClientChartsConfigArgs = {
    withoutRerender?: boolean;
    isInitialPreview?: boolean;
};

type UpdateClientChartsConfigAction = {
    type: typeof UPDATE_CLIENT_CHARTS_CONFIG;
    clientChartsConfigArgs: UpdateClientChartsConfigArgs;
};

export function updateClientChartsConfig(
    clientChartsConfigArgs: UpdateClientChartsConfigArgs,
): UpdateClientChartsConfigAction {
    return {
        type: UPDATE_CLIENT_CHARTS_CONFIG,
        clientChartsConfigArgs,
    };
}

export type PreviewAction =
    | UpdatePreviewAction
    | SetHighchartsWidgetAction
    | SetUpdatesAction
    | UpdateClientChartsConfigAction;
