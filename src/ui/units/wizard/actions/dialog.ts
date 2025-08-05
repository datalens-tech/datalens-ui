import _isEqual from 'lodash/isEqual';

import type {
    ColorsConfig,
    CommonSharedExtraSettings,
    Dataset,
    DatasetUpdate,
    Field,
    Link,
    Placeholder,
    PointSizeConfig,
    ServerChartsConfig,
    ShapesConfig,
    Shared,
} from '../../../../shared';
import {WizardVisualizationId, isMeasureValue} from '../../../../shared';
import type {ApplyData, DatalensGlobalState, Filter} from '../../../../ui';
import {fetchColorPalettes} from '../../../store/actions/colorPaletteEditor';
import {closeDialog, openDialog, openDialogFilter} from '../../../store/actions/dialog';
import {selectColorPalettes} from '../../../store/selectors/colorPaletteEditor';
import {getChartType} from '../../ql/store/reducers/ql';
import type {DialogColumnSettingsFields} from '../components/Dialogs/DialogColumnSettings/DialogColumnSettings';
import {DIALOG_COLUMN_SETTINGS} from '../components/Dialogs/DialogColumnSettings/DialogColumnSettings';
import type {ColumnSettingsState} from '../components/Dialogs/DialogColumnSettings/hooks/useDialogColumnSettingsState';
import type {LabelSettings} from '../components/Dialogs/DialogLabelSettings/DialogLabelSettings';
import {DIALOG_LABEL_SETTINGS} from '../components/Dialogs/DialogLabelSettings/DialogLabelSettings';
import {DIALOG_METRIC_SETTINGS} from '../components/Dialogs/DialogMetricSettings/DialogMetricSettings';
import {DIALOG_MULTIDATASET} from '../components/Dialogs/DialogMultidataset';
import {DIALOG_PLACEHOLDER} from '../components/Dialogs/DialogPlaceholder/DialogPlaceholder';
import {DIALOG_POINTS_SIZE} from '../components/Dialogs/DialogPointsSize';
import {DIALOG_SHAPES} from '../components/Dialogs/DialogShapes/DialogShapes';
import {DIALOG_CHART_SETTINGS} from '../components/Dialogs/Settings/Settings';
import {PaletteTypes, VISUALIZATION_IDS} from '../constants';
import type {WizardDispatch} from '../reducers';
import {getChangedPlaceholderSettings} from '../reducers/utils/getPlaceholdersWithMergedSettings';
import {selectParameters} from '../selectors/dataset';
import {isColorModeChangeAvailable} from '../selectors/dialogColor';
import {selectWizardWorkbookId} from '../selectors/settings';
import {
    selectDashboardParameters,
    selectDistincts,
    selectDrillDownLevel,
    selectSegments,
    selectSort,
    selectSubVisualization,
    selectVisualization,
} from '../selectors/visualization';
import {selectExtraSettings, selectWidget} from '../selectors/widget';
import {getVisualization} from '../utils/helpers';
import {getItemForShapeSection} from '../utils/shapes';

import {openDialogColor} from './dialogColor';
import {updatePreviewAndClientChartsConfig} from './preview';
import {setColorsConfig, setPointsSizeConfig, setShapesConfig} from './visualization';
import {setExtraSettings} from './widget';

import {setVisualization} from './index';

type OpenDialogPlaceholderArguments = {
    placeholder: Placeholder;
    onApply?: () => void;
};

export function openDialogPlaceholder({placeholder, onApply}: OpenDialogPlaceholderArguments) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const state = getState();
        const visualization = selectVisualization(state);
        const segments = selectSegments(state);
        const sort = selectSort(state);
        const drillDownLevel = selectDrillDownLevel(state);
        const chartConfig = state.wizard.visualization as Partial<ServerChartsConfig>;

        if (visualization) {
            dispatch(
                openDialog({
                    id: DIALOG_PLACEHOLDER,
                    props: {
                        chartConfig,
                        visualizationId: visualization.id as WizardVisualizationId,
                        drillDownLevel,
                        segments,
                        sort,
                        visible: true,
                        item: placeholder,
                        onCancel: () => dispatch(closeDialog()),
                        onApply: (newSettings) => {
                            const visualizationsList =
                                visualization.id === 'combined-chart'
                                    ? visualization.layers
                                    : [getVisualization(visualization)!];

                            visualizationsList.forEach((item) => {
                                const layerPlaceholder = item.placeholders.find(
                                    (layerPlaceholder) => layerPlaceholder.id === placeholder.id,
                                );

                                if (!layerPlaceholder) {
                                    return;
                                }

                                const changedSettingsKey = getChangedPlaceholderSettings({
                                    presetSettings: newSettings,
                                    oldSettings: layerPlaceholder.settings || {},
                                });

                                if (!changedSettingsKey.length) {
                                    return;
                                }

                                layerPlaceholder.settings = changedSettingsKey.reduce(
                                    (acc, key) => {
                                        acc[key] = (newSettings as Record<string, any>)[key];

                                        return acc;
                                    },
                                    {...layerPlaceholder.settings},
                                );
                            });

                            dispatch(closeDialog());

                            dispatch(updatePreviewAndClientChartsConfig({}));

                            if (onApply) {
                                onApply();
                            }
                        },
                    },
                }),
            );
        }
    };
}

type OpenDialogMetricArguments = {
    extraSettings: CommonSharedExtraSettings | undefined;
};

export function openDialogMetric({extraSettings}: OpenDialogMetricArguments) {
    return async function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const colorPalettes = selectColorPalettes(getState());
        if (!colorPalettes.length) {
            await dispatch(fetchColorPalettes());
        }

        dispatch(
            openDialog({
                id: DIALOG_METRIC_SETTINGS,
                props: {
                    onSave: ({size, palette, color, colorIndex}) => {
                        // TODO: use either index or color
                        // const metricSettins =
                        //     typeof colorIndex === 'number'
                        //         ? {
                        //               metricFontColorIndex: colorIndex,
                        //               metricFontSize: size,
                        //               metricFontColorPalette: palette,
                        //               metricFontColor: undefined,
                        //           }
                        //         : {
                        //               metricFontSize: size,
                        //               metricFontColor: color,
                        //               metricFontColorPalette: palette,
                        //               metricFontColorIndex: undefined,
                        //           };

                        const metricSettins = {
                            metricFontColorIndex: colorIndex,
                            metricFontSize: size,
                            metricFontColorPalette: palette,
                            metricFontColor: color,
                        };

                        dispatch(setExtraSettings({...extraSettings, ...metricSettins}));

                        dispatch(updatePreviewAndClientChartsConfig({}));
                    },
                },
            }),
        );
    };
}

type OpenDialogPointsSizeArguments = {
    geopointsConfig: PointSizeConfig;
    placeholder: Placeholder;
    visualization: Shared['visualization'];
    onApply?: () => void;
};

export function openDialogPointsSize({
    geopointsConfig,
    placeholder,
    visualization,
    onApply,
}: OpenDialogPointsSizeArguments) {
    return function (dispatch: WizardDispatch) {
        const visualizationId = visualization.id;

        const pointType =
            visualizationId === WizardVisualizationId.Scatter ||
            visualizationId === WizardVisualizationId.ScatterD3
                ? 'scatter'
                : 'geopoint';

        dispatch(
            openDialog({
                id: DIALOG_POINTS_SIZE,
                props: {
                    pointType,
                    geopointsConfig: geopointsConfig,
                    hasMeasure: Boolean(placeholder.items.length),
                    onCancel: () => dispatch(closeDialog()),
                    onApply: (config: PointSizeConfig) => {
                        dispatch(setPointsSizeConfig({geopointsConfig: config}));

                        dispatch(closeDialog());

                        dispatch(updatePreviewAndClientChartsConfig({}));

                        onApply?.();
                    },
                },
            }),
        );
    };
}

type OpenDialogColorsArguments = {
    item?: Field | Field[];
    // this prop is used only when multiple colors supported in colors section; otherwise it will be undefined;
    colorSectionFields?: Field[];
    onApply?: () => void;
};

export function openDialogColors({item, onApply, colorSectionFields}: OpenDialogColorsArguments) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const datalensGlobalState = getState();
        const {visualization: visualizationState, dataset: datasetState} =
            datalensGlobalState.wizard;
        const {colors, colorsConfig} = visualizationState;
        const dataset = datasetState.dataset;
        const isArray = Array.isArray(item);
        const extra: any = {};

        const subVisualization = selectSubVisualization(datalensGlobalState);

        if (!subVisualization) {
            return;
        }

        const placeholders = subVisualization.placeholders;

        if (subVisualization.id === VISUALIZATION_IDS.GEOPOLYGON) {
            extra.polygonBorders = true;
        }

        if (dataset) {
            const y2Placeholder = placeholders.find((placeholder) => placeholder.id === 'y2');
            const heatmapPlaceholder = placeholders.find(
                (placeholder) => placeholder.id === 'heatmap',
            );

            const dialogColorItem = isArray
                ? colors[0] ||
                  placeholders[1]?.items[0] ||
                  (y2Placeholder && y2Placeholder.items[0]) ||
                  (heatmapPlaceholder && heatmapPlaceholder.items[0])
                : (item as Field);

            const dialogColorItems =
                isArray && !isMeasureValue(dialogColorItem) ? (item as Field[]) : undefined;

            const isColorModeChangeAvailableValue = isColorModeChangeAvailable({
                item: dialogColorItem,
                visualizationId: subVisualization.id,
            });

            dispatch(
                openDialogColor({
                    item: dialogColorItem,
                    extra,
                    colorSectionFields,
                    items: dialogColorItems,
                    isColorModeChangeAvailable: isColorModeChangeAvailableValue,
                    onApply: (config: ColorsConfig) => {
                        dispatch(
                            setColorsConfig({
                                colorsConfig: config,
                            }),
                        );

                        dispatch(closeDialog());

                        dispatch(updatePreviewAndClientChartsConfig({}));

                        if (onApply) {
                            onApply();
                        }
                    },
                    colorsConfig,
                    canSetNullMode: true,
                }),
            );
        }
    };
}

type OpenDialogShapesArguments = {
    item?: Field | Field[];
    paletteType: PaletteTypes;
    onApply?: () => void;
};

export function openDialogShapes({
    item,
    paletteType = PaletteTypes.Lines,
    onApply,
}: OpenDialogShapesArguments) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();
        const {dataset: datasetState, preview: previewState} = globalState.wizard;
        const visualization = selectSubVisualization(globalState);
        const {shapesConfig, shapes, filters, dashboardParameters} =
            globalState.wizard.visualization;
        const dataset = datasetState.dataset;
        const updates = previewState.updates;
        const parameters = selectParameters(globalState);
        const distincts = selectDistincts(globalState);

        if (dataset && visualization) {
            const isArray = Array.isArray(item);
            dispatch(
                openDialog({
                    id: DIALOG_SHAPES,
                    props: {
                        parameters,
                        dashboardParameters,
                        item: isArray
                            ? shapes[0] || getItemForShapeSection(visualization)
                            : (item as Field),
                        items: isArray ? (item as Field[]) : undefined,
                        distincts,
                        datasetId: dataset.id,
                        shapesConfig,
                        updates,
                        filters,
                        options: dataset && dataset.options,
                        paletteType,
                        onApply: (config: ShapesConfig) => {
                            dispatch(setShapesConfig({shapesConfig: config}));

                            dispatch(closeDialog());

                            dispatch(updatePreviewAndClientChartsConfig({}));

                            if (onApply) {
                                onApply();
                            }
                        },
                        onCancel: () => dispatch(closeDialog()),
                    },
                }),
            );
        }
    };
}

export function openDialogChartSettings({
    onUpdate,
    qlMode,
}: {
    onUpdate?: () => void;
    qlMode?: boolean;
}) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const wizardState = getState().wizard;
        const widget = selectWidget(getState());
        const dataset = wizardState.dataset.dataset;
        const datasets = wizardState.dataset.datasets;
        const visualization = wizardState.visualization.visualization as Shared['visualization'];
        const extraSettings = wizardState.widget.extraSettings!;
        const chartType = getChartType(getState());
        dispatch(
            openDialog({
                id: DIALOG_CHART_SETTINGS,
                props: {
                    chartType,
                    widget,
                    dataset,
                    datasetsCount: datasets.length,
                    visualization,
                    extraSettings,
                    qlMode,
                    onCancel: () => dispatch(closeDialog()),
                    onApply: ({extraSettings, visualization, isSettingsEqual, qlMode}) => {
                        dispatch(setExtraSettings(extraSettings));
                        dispatch(setVisualization({visualization}));

                        dispatch(
                            updatePreviewAndClientChartsConfig({
                                withoutRerender: isSettingsEqual,
                                qlMode,
                            }),
                        );

                        dispatch(closeDialog());

                        if (onUpdate) {
                            onUpdate();
                        }
                    },
                },
            }),
        );
    };
}

type OpenDialogMultidatasetArguments = {
    onAddDatasetClick: () => void;
    onRemoveDatasetClick: (dataset: Dataset) => void;
    onApply: (args: {links: Link[]}) => void;
    initedDataset: Dataset | undefined;
};

export function openDialogMultidataset({
    onAddDatasetClick,
    onRemoveDatasetClick,
    onApply,
    initedDataset,
}: OpenDialogMultidatasetArguments) {
    return function (dispatch: WizardDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_MULTIDATASET,
                props: {
                    initedDataset,
                    onAddDatasetClick,
                    onRemoveDatasetClick,
                    onApply,
                    onCancel: () => dispatch(closeDialog()),
                },
            }),
        );
    };
}

type WizardDialogFilterArgs = {
    filterItem: Field;
    onDialogFilterApply: (data: ApplyData) => void;
    onDialogFilterCancel?: () => void;
};

export function openWizardDialogFilter({
    filterItem,
    onDialogFilterApply,
    onDialogFilterCancel,
}: WizardDialogFilterArgs) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const state = getState();
        const datasets = state.wizard.dataset.datasets;
        const updates = state.wizard.preview.updates;
        const parameters = selectParameters(state);
        const dashboardParameters = selectDashboardParameters(state);
        const workbookId = selectWizardWorkbookId(state);

        const dataset = datasets.find((currDataset) => currDataset.id === filterItem.datasetId);
        const isFieldExist = dataset?.dataset.result_schema.some(
            (item) => item.guid === filterItem.guid,
        );

        if (dataset && isFieldExist) {
            let filter;
            if (filterItem && filterItem.filter) {
                // We bring the filter to the form in which this field is stored in the dataset on the backend
                filter = {
                    values: filterItem.filter.value,
                    operation: filterItem.filter.operation.code,
                } as Filter;
            }

            dispatch(
                openDialogFilter({
                    field: filterItem,
                    datasetId: dataset.id,
                    workbookId,
                    options: dataset.options,
                    onApply: onDialogFilterApply,
                    onClose: onDialogFilterCancel,
                    filter,
                    updates: updates as DatasetUpdate[],
                    dashboardParameters,
                    parameters,
                }),
            );
        }
    };
}

type OpenDialogColumnSettingsArguments = {
    onApply: (
        fields: {columns: ColumnSettingsState; rows: ColumnSettingsState},
        pinnedColumns?: number,
    ) => void;
    fields: DialogColumnSettingsFields;
    visualizationId: WizardVisualizationId;
    pinnedColumns?: number;
};

export function openDialogColumnSettings({
    onApply,
    fields,
    visualizationId,
    pinnedColumns,
}: OpenDialogColumnSettingsArguments) {
    return function (dispatch: WizardDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_COLUMN_SETTINGS,
                props: {
                    visualizationId,
                    fields,
                    pinnedColumns,
                    onApply: (args) => {
                        onApply(args.fields, args.pinnedColumns);
                        dispatch(closeDialog());
                    },
                    onClose: () => dispatch(closeDialog()),
                },
            }),
        );
    };
}

type OpenDialogLabelSettingsArguments = {
    visualizationId: WizardVisualizationId;
    onUpdate?: () => void;
};

export function openDialogLabelSettings({
    visualizationId,
    onUpdate,
}: OpenDialogLabelSettingsArguments) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        dispatch(
            openDialog({
                id: DIALOG_LABEL_SETTINGS,
                props: {
                    visualizationId,
                    onApply: (settings: LabelSettings) => {
                        const prevSettings = selectExtraSettings(getState());
                        const newSettings = {
                            ...prevSettings,
                            ...settings,
                        } as CommonSharedExtraSettings;
                        const isSettingsEqual = _isEqual(prevSettings, newSettings);

                        if (!isSettingsEqual) {
                            dispatch(setExtraSettings(newSettings));

                            dispatch(
                                updatePreviewAndClientChartsConfig({
                                    withoutRerender: false,
                                }),
                            );

                            if (onUpdate) {
                                onUpdate();
                            }
                        }

                        dispatch(closeDialog());
                    },
                    onClose: () => dispatch(closeDialog()),
                },
            }),
        );
    };
}
