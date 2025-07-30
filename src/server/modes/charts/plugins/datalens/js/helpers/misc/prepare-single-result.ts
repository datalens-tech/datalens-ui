import type {
    ColorPalette,
    DATASET_FIELD_TYPES,
    FeatureConfig,
    IChartEditor,
    Palette,
    ServerChartsConfig,
    ServerVisualization,
    ServerVisualizationLayer,
} from '../../../../../../../../shared';
import {
    Feature,
    WizardVisualizationId,
    isMonitoringOrPrometheusChart,
} from '../../../../../../../../shared';
import prepareBackendPivotTableData from '../../../preparers/backend-pivot-table';
import type {PivotData} from '../../../preparers/backend-pivot-table/types';
import {prepareD3BarX, prepareHighchartsBarX} from '../../../preparers/bar-x';
import {prepareGravityChartsBarY, prepareHighchartsBarY} from '../../../preparers/bar-y';
import prepareFlatTableData from '../../../preparers/flat-table';
import prepareGeopointData from '../../../preparers/geopoint';
import prepareGeopolygonData from '../../../preparers/geopolygon';
import prepareHeatmapData from '../../../preparers/heatmap';
import {prepareHighchartsLine} from '../../../preparers/line';
import {prepareD3Line} from '../../../preparers/line/gravity-charts';
import prepareLineTime from '../../../preparers/line-time';
import prepareMetricData from '../../../preparers/metric';
import preparePivotTableData from '../../../preparers/old-pivot-table/old-pivot-table';
import {prepareD3Pie, prepareHighchartsPie} from '../../../preparers/pie';
import preparePolylineData from '../../../preparers/polyline';
import {prepareD3Scatter, prepareHighchartsScatter} from '../../../preparers/scatter';
import {prepareD3Treemap, prepareHighchartsTreemap} from '../../../preparers/treemap';
import type {PrepareFunction, PrepareFunctionResultData} from '../../../preparers/types';
import {getServerDateFormat} from '../../../utils/misc-helpers';
import {OversizeErrorType} from '../../constants/errors';
import {getChartColorsConfig} from '../colors';
import {getOversizeError} from '../errors/oversize-error';
import {
    isBackendPivotCellsOversizeError,
    isBackendPivotColumnsOversizeError,
    isDefaultOversizeError,
} from '../errors/oversize-error/utils';

type PrepareSingleResultArgs = {
    resultData: PrepareFunctionResultData;
    visualization: ServerVisualization;
    shared: ServerChartsConfig;
    idToTitle: Record<string, string>;
    idToDataType: Record<string, DATASET_FIELD_TYPES>;
    ChartEditor: IChartEditor;
    datasetsIds: string[];
    palettes: Record<string, Palette>;
    loadedColorPalettes?: Record<string, ColorPalette>;
    disableDefaultSorting?: boolean;
    features: FeatureConfig;
};

// eslint-disable-next-line complexity
export default ({
    resultData,
    visualization,
    shared,
    idToTitle,
    idToDataType,
    ChartEditor,
    datasetsIds,
    loadedColorPalettes = {},
    disableDefaultSorting = false,
    palettes,
    features,
}: PrepareSingleResultArgs) => {
    const {
        sharedData: {drillDownData},
        chartType,
    } = shared;

    let rowsLength: undefined | number;

    let cellsCount: number | undefined;
    let columnsCount: number | undefined;

    if ((resultData as any)?.pivot_data) {
        const pivotData = (resultData as any).pivot_data as PivotData;

        const rows = pivotData.rows || [];
        const columns = pivotData.columns || [];

        const rowsValues = rows[0]?.values || [];

        cellsCount = rows.length * rowsValues.length;
        columnsCount = columns.length;
    } else {
        rowsLength = resultData.data && resultData.data.length;
    }

    if (drillDownData) {
        const currentDrillDownField = drillDownData.fields[drillDownData.level];
        ChartEditor.updateConfig({
            drillDown: {
                breadcrumbs: drillDownData.breadcrumbs,
                dateFormat: getServerDateFormat(currentDrillDownField?.data_type),
            },
        });

        ChartEditor.updateParams({
            drillDownLevel: drillDownData.level,
            drillDownFilters: drillDownData.filters,
            isColorDrillDown: drillDownData.isColorDrillDown,
        });
    }

    if (rowsLength === 0) {
        return {};
    }

    let prepare;

    let rowsLimit: number | undefined;
    let cellsLimit: number | undefined;
    let columnsLimit: number | undefined;

    const segments = shared.segments || [];

    switch (visualization.id) {
        case WizardVisualizationId.Line:
        case WizardVisualizationId.Area:
        case WizardVisualizationId.Area100p: {
            rowsLimit = 75000;
            prepare = isMonitoringOrPrometheusChart(chartType)
                ? prepareLineTime
                : prepareHighchartsLine;
            break;
        }

        case WizardVisualizationId.Column:
        case WizardVisualizationId.Column100p: {
            rowsLimit = 75000;
            prepare = isMonitoringOrPrometheusChart(chartType)
                ? prepareLineTime
                : prepareHighchartsBarX;
            break;
        }

        case WizardVisualizationId.LineD3: {
            prepare = isMonitoringOrPrometheusChart(chartType) ? prepareLineTime : prepareD3Line;
            rowsLimit = 75000;
            break;
        }

        case WizardVisualizationId.Bar:
        case WizardVisualizationId.Bar100p: {
            prepare = prepareHighchartsBarY;
            rowsLimit = 75000;
            break;
        }

        case WizardVisualizationId.BarYD3:
        case WizardVisualizationId.BarY100pD3: {
            prepare = prepareGravityChartsBarY;
            rowsLimit = 75000;
            break;
        }

        case WizardVisualizationId.BarXD3: {
            prepare = prepareD3BarX;
            rowsLimit = 75000;
            break;
        }

        case WizardVisualizationId.Scatter:
            prepare = prepareHighchartsScatter;
            rowsLimit = 75000;
            break;

        case WizardVisualizationId.ScatterD3:
            prepare = prepareD3Scatter;
            rowsLimit = 75000;
            break;

        case WizardVisualizationId.Pie:
        case WizardVisualizationId.Donut:
            if (features[Feature.GravityAsDefaultWizardVisualizationLibrary]) {
                prepare = prepareD3Pie;
            } else {
                prepare = prepareHighchartsPie;
            }
            rowsLimit = 1000;
            break;

        case WizardVisualizationId.PieD3:
        case WizardVisualizationId.DonutD3:
            prepare = prepareD3Pie;
            rowsLimit = 1000;
            break;

        case WizardVisualizationId.Metric:
            prepare = prepareMetricData;
            rowsLimit = 1000;
            break;

        case WizardVisualizationId.Treemap:
            if (features[Feature.GravityAsDefaultWizardVisualizationLibrary]) {
                prepare = prepareD3Treemap;
            } else {
                prepare = prepareHighchartsTreemap;
            }
            rowsLimit = 800;
            break;

        case WizardVisualizationId.TreemapD3:
            prepare = prepareD3Treemap;
            rowsLimit = 800;
            break;

        case WizardVisualizationId.FlatTable:
            prepare = prepareFlatTableData;
            rowsLimit = 100000;
            break;

        case WizardVisualizationId.PivotTable: {
            const pivotFallbackEnabled = shared.extraSettings?.pivotFallback === 'on';

            if (pivotFallbackEnabled) {
                prepare = preparePivotTableData;
                rowsLimit = 40000;
            } else {
                prepare = prepareBackendPivotTableData;
                cellsLimit = 100000;
                columnsLimit = 800;
            }
            break;
        }
        case 'geopoint':
            prepare = prepareGeopointData;
            rowsLimit = 40000;
            break;

        case 'geopolygon':
            prepare = prepareGeopolygonData;
            rowsLimit = 40000;
            break;

        case 'heatmap':
            prepare = prepareHeatmapData;
            rowsLimit = 40000;
            break;

        case 'polyline':
            prepare = preparePolylineData;
            rowsLimit = 40000;
            break;
    }

    const oversize = isDefaultOversizeError(rowsLength, rowsLimit);
    const backendPivotCellsOversize = isBackendPivotCellsOversizeError(cellsCount, cellsLimit);
    const backendPivotColumnsOversize = isBackendPivotColumnsOversizeError(
        columnsCount,
        columnsLimit,
    );

    const isChartOversizeError =
        oversize || backendPivotCellsOversize || backendPivotColumnsOversize;

    if (isChartOversizeError) {
        let errorType;
        let limit;
        let current;
        if (backendPivotColumnsOversize) {
            errorType = OversizeErrorType.PivotTableColumns;
            limit = columnsLimit!;
            current = columnsCount!;
        } else if (backendPivotCellsOversize) {
            errorType = OversizeErrorType.PivotTableCells;
            limit = cellsLimit!;
            current = cellsCount;
        } else {
            errorType = OversizeErrorType.Default;
            limit = rowsLimit!;
            current = rowsLength!;
        }

        const oversizeError = getOversizeError({
            type: errorType,
            limit,
            current: current!,
        });

        ChartEditor._setError(oversizeError);

        return {};
    }

    let {
        shapes = [],
        shapesConfig = {},
        colors = [],
        colorsConfig,
        labels = [],
        tooltips = [],
        tooltipConfig,
        geopointsConfig,
        sort = [],
    } = shared;

    if ((visualization as ServerVisualizationLayer).layerSettings) {
        ({
            geopointsConfig,
            colors,
            colorsConfig = {},
            labels,
            tooltips,
            sort,
            shapes = [],
            shapesConfig = {},
            tooltipConfig = {},
        } = (visualization as ServerVisualizationLayer).commonPlaceholders);
    }

    const chartColorsConfig = getChartColorsConfig({
        loadedColorPalettes,
        colorsConfig,
        availablePalettes: palettes,
    });

    const prepareFunctionArgs = {
        placeholders: visualization.placeholders,
        fields: [],
        colors,
        colorsConfig: chartColorsConfig,
        geopointsConfig,
        sort,
        visualizationId: visualization.id,
        layerSettings: (visualization as ServerVisualizationLayer).layerSettings,
        labels,
        tooltips,
        tooltipConfig,
        datasets: datasetsIds,

        resultData,
        idToTitle,
        idToDataType,
        shared,
        ChartEditor,
        shapes,
        shapesConfig,
        segments,

        disableDefaultSorting,
        features,
    };

    return (prepare as PrepareFunction)(prepareFunctionArgs);
};
