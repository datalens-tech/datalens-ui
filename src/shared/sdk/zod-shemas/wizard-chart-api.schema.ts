import * as z from 'zod/v4';

import {
    ColorMode,
    GradientNullModes,
    IndicatorTitleMode,
    LabelsPositions,
    MapCenterMode,
    ZoomMode,
} from '../..';
import {WidgetSize} from '../../constants';
import {MARKUP_TYPE} from '../../types/charts';
import type {DatasetFieldCalcMode} from '../../types/dataset';
import {
    AxisLabelFormatMode,
    AxisMode,
    AxisNullsMode,
    ChartsConfigVersion,
    NumberFormatType,
    NumberFormatUnit,
} from '../../types/wizard';

// Helper type for enum to literal conversion
type EnumToLiteral<T extends string | number> = T extends string
    ? `${T}`
    : `${T}` extends `${infer N extends number}`
      ? N
      : never;

type ValueOf<T> = T[keyof T];

// Constants for enum arrays - base arrays
const showHideValuesList = ['show', 'hide'] as const;
const onOffValuesList = ['on', 'off'] as const;
const autoManualValuesList = ['auto', 'manual'] as const;
const yesNoValuesList = ['yes', 'no'] as const;

// Constants for literal values
const SCALE_VALUE_LITERAL = '0-max';
const LOGARITHMIC_TYPE_LITERAL = 'logarithmic';
const MANUAL_GRID_STEP_LITERAL = 'manual';
const DATALENS_TYPE_LITERAL = 'datalens';

// Constants for enum arrays - specific arrays
const DatasetFieldCalcModeList: DatasetFieldCalcMode[] = ['formula', 'direct', 'parameter'];
const titleModeList = showHideValuesList;
const legendModeList = showHideValuesList;
const tooltipModeList = showHideValuesList;
const onOffList = onOffValuesList;
const groupingList = ['disabled', 'off'] as const;
const scaleList = autoManualValuesList;
const titleList = ['auto', 'manual', 'off'] as const;
const gridList = onOffValuesList;
const hideLabelsLis = yesNoValuesList;
const labelsViewList = ['horizontal', 'vertical', 'angle'] as const;
const holidaysList = onOffValuesList;
const axisVisibilityList = showHideValuesList;
const colorFieldTitleList = onOffValuesList;
const v12UpdateActionsList = [
    'add_field',
    'add',
    'update_field',
    'update',
    'delete',
    'delete_field',
] as const;

// Basic schemas
const parameterDefaultValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const datasetFieldCalcModeSchema = z.enum(DatasetFieldCalcModeList);

// Enum schemas using Object.values for regular enums
const colorModeSchema = z.enum(Object.values(ColorMode) as EnumToLiteral<ColorMode>[]);
const gradientNullModeSchema = z.enum(
    Object.values(GradientNullModes) as ValueOf<typeof GradientNullModes>[],
);
const indicatorTitleModeSchema = z.enum([
    IndicatorTitleMode.ByField,
    IndicatorTitleMode.Hide,
    IndicatorTitleMode.Manual,
]);
const labelsPositionsSchema = z.enum(
    Object.values(LabelsPositions) as EnumToLiteral<LabelsPositions>[],
);
const markupTypeSchema = z.enum(
    Object.values(MARKUP_TYPE) as [
        EnumToLiteral<(typeof MARKUP_TYPE)[keyof typeof MARKUP_TYPE]>,
        ...EnumToLiteral<(typeof MARKUP_TYPE)[keyof typeof MARKUP_TYPE]>[],
    ],
);
const widgetSizeTypeSchema = z.enum(
    Object.values(WidgetSize) as [
        EnumToLiteral<(typeof WidgetSize)[keyof typeof WidgetSize]>,
        ...EnumToLiteral<(typeof WidgetSize)[keyof typeof WidgetSize]>[],
    ],
);

// Const enum schemas using direct values
const axisLabelFormatModeSchema = z.enum([AxisLabelFormatMode.Auto, AxisLabelFormatMode.ByField]);
const axisModeSchema = z.enum([AxisMode.Discrete, AxisMode.Continuous]);
const axisNullsModeSchema = z.enum([
    AxisNullsMode.Ignore,
    AxisNullsMode.Connect,
    AxisNullsMode.AsZero,
    AxisNullsMode.UsePrevious,
]);
const numberFormatTypeSchema = z.enum([NumberFormatType.Number, NumberFormatType.Percent]);
const numberFormatUnitSchema = z.enum([
    NumberFormatUnit.Auto,
    NumberFormatUnit.B,
    NumberFormatUnit.K,
    NumberFormatUnit.M,
    NumberFormatUnit.T,
]);

// Simple string enums for types that are not available as runtime values
const mapCenterModesSchema = z.enum([MapCenterMode.Auto, MapCenterMode.Manual]);
const zoomModesSchema = z.enum([ZoomMode.Auto, ZoomMode.Manual]);

// V12ClientOnlyFields schema
const v12ClientOnlyFieldsSchema = z.object({
    fakeTitle: z.string().optional(),
    originalTitle: z.string().optional(),
    markupType: markupTypeSchema.optional(),
});

// V12Formatting schema
const v12FormattingSchema = z.object({
    format: numberFormatTypeSchema.optional(),
    showRankDelimiter: z.boolean().optional(),
    prefix: z.string().optional(),
    postfix: z.string().optional(),
    unit: numberFormatUnitSchema.optional(),
    precision: z.number().optional(),
    labelMode: z.string().optional(),
});

// V12NavigatorSettings schema
const v12NavigatorSettingsSchema = z.object({
    navigatorMode: z.string(),
    isNavigatorAvailable: z.boolean(),
    selectedLines: z.array(z.string()),
    linesMode: z.string(),
    periodSettings: z.object({
        type: z.string(),
        value: z.string(),
        period: z.string(),
    }),
});

// V12CommonSharedExtraSettings schema
const v12CommonSharedExtraSettingsSchema = z.object({
    title: z.string().optional(),
    titleMode: z.enum(titleModeList).optional(),
    indicatorTitleMode: indicatorTitleModeSchema.optional(),
    legendMode: z.enum(legendModeList).optional(),
    metricFontSize: z.string().optional(),
    metricFontColor: z.string().optional(),
    tooltip: z.enum(tooltipModeList).optional(),
    tooltipSum: z.enum(onOffList).optional(),
    limit: z.number().optional(),
    pagination: z.enum(onOffList).optional(),
    navigatorMode: z.string().optional(),
    navigatorSeriesName: z.string().optional(),
    totals: z.enum(onOffList).optional(),
    pivotFallback: z.enum(onOffList).optional(),
    pivotInlineSort: z.enum(onOffList).optional(),
    stacking: z.enum(onOffList).optional(),
    overlap: z.enum(onOffList).optional(),
    feed: z.string().optional(),
    navigatorSettings: v12NavigatorSettingsSchema.optional(),
    enableGPTInsights: z.boolean().optional(),
    labelsPosition: labelsPositionsSchema.optional(),
    pinnedColumns: z.number().optional(),
    size: widgetSizeTypeSchema.optional(),
    zoomMode: zoomModesSchema.optional(),
    zoomValue: z.number().nullable().optional(),
    mapCenterMode: mapCenterModesSchema.optional(),
    mapCenterValue: z.string().nullable().optional(),
    preserveWhiteSpace: z.boolean().optional(),
});

// V12Filter schema
const v12FilterSchema = z
    .object({
        guid: z.string(),
        datasetId: z.string(),
        disabled: z.string().optional(),
        filter: z.object({
            operation: z.object({
                code: z.string(),
            }),
            value: z.union([z.string(), z.array(z.string())]).optional(),
        }),
        type: z.string(),
        title: z.string(),
        calc_mode: datasetFieldCalcModeSchema,
    })
    .merge(v12ClientOnlyFieldsSchema);

// V12Sort schema
const v12SortSchema = z
    .object({
        guid: z.string(),
        title: z.string(),
        source: z.string().optional(),
        datasetId: z.string(),
        direction: z.string(),
        data_type: z.string(),
        format: z.string().optional(),
        type: z.string(),
        default_value: parameterDefaultValueSchema.optional(),
    })
    .merge(v12ClientOnlyFieldsSchema);

// V12LinkField schema
const v12LinkFieldSchema = z.object({
    field: z.object({
        title: z.string(),
        guid: z.string(),
    }),
    dataset: z.object({
        id: z.string(),
        realName: z.string(),
    }),
});

// V12Link schema
const v12LinkSchema = z.object({
    id: z.string(),
    fields: z.record(z.string(), v12LinkFieldSchema),
});

// V12PlaceholderSettings schema
const v12PlaceholderSettingsSchema = z.object({
    groupping: z.enum(groupingList).optional(),
    autoscale: z.boolean().optional(),
    scale: z.enum(scaleList).optional(),
    scaleValue: z
        .union([z.literal(SCALE_VALUE_LITERAL), z.tuple([z.string(), z.string()])])
        .optional(),
    title: z.enum(titleList).optional(),
    titleValue: z.string().optional(),
    type: z.literal(LOGARITHMIC_TYPE_LITERAL).optional(),
    grid: z.enum(gridList).optional(),
    gridStep: z.literal(MANUAL_GRID_STEP_LITERAL).optional(),
    gridStepValue: z.number().optional(),
    hideLabels: z.enum(hideLabelsLis).optional(),
    labelsView: z.enum(labelsViewList).optional(),
    nulls: axisNullsModeSchema.optional(),
    holidays: z.enum(holidaysList).optional(),
    axisFormatMode: axisLabelFormatModeSchema.optional(),
    axisModeMap: z.record(z.string(), axisModeSchema).optional(),
    disableAxisMode: z.boolean().optional(),
    axisVisibility: z.enum(axisVisibilityList).optional(),
});

// Forward declaration for recursive types
const v12FieldSchema: z.ZodType<any> = z.lazy(() =>
    z
        .object({
            data_type: z.string(),
            fields: z.array(v12FieldSchema).optional(),
            type: z.string(),
            title: z.string(),
            guid: z.string(),
            formatting: v12FormattingSchema.optional(),
            format: z.string().optional(),
            datasetId: z.string(),
            source: z.string().optional(),
            datasetName: z.string().optional(),
            hideLabelMode: z.string().optional(),
            calc_mode: datasetFieldCalcModeSchema,
            default_value: parameterDefaultValueSchema.optional(),
            barsSettings: z.any().optional(), // TableBarsSettings
            subTotalsSettings: z.any().optional(), // TableSubTotalsSettings
            backgroundSettings: z.any().optional(), // TableFieldBackgroundSettings
            columnSettings: z.any().optional(), // ColumnSettings
            hintSettings: z.any().optional(), // HintSettings
        })
        .merge(v12ClientOnlyFieldsSchema),
);

// V12Placeholder schema
const v12PlaceholderSchema = z.object({
    id: z.string(),
    settings: v12PlaceholderSettingsSchema.optional(),
    required: z.boolean().optional(),
    capacity: z.number().optional(),
    items: z.array(v12FieldSchema),
});

// V12Color schema
const v12ColorSchema = z
    .object({
        datasetId: z.string(),
        guid: z.string(),
        title: z.string(),
        type: z.string(),
        data_type: z.string(),
        formatting: v12FormattingSchema.optional(),
        calc_mode: datasetFieldCalcModeSchema,
    })
    .merge(v12ClientOnlyFieldsSchema);

// V12Shape schema
const v12ShapeSchema = z
    .object({
        datasetId: z.string(),
        guid: z.string(),
        title: z.string(),
        originalTitle: z.string().optional(),
        type: z.string(),
        data_type: z.string(),
        calc_mode: datasetFieldCalcModeSchema,
    })
    .merge(v12ClientOnlyFieldsSchema);

// V12Tooltip schema
const v12TooltipSchema = z
    .object({
        datasetId: z.string(),
        guid: z.string(),
        title: z.string(),
        formatting: v12FormattingSchema.optional(),
        data_type: z.string(),
        calc_mode: datasetFieldCalcModeSchema,
    })
    .merge(v12ClientOnlyFieldsSchema);

// V12Label schema
const v12LabelSchema = z.object({
    datasetId: z.string(),
    type: z.string(),
    title: z.string(),
    guid: z.string(),
    formatting: v12FormattingSchema.optional(),
    format: z.string().optional(),
    data_type: z.string(),
    calc_mode: datasetFieldCalcModeSchema,
});

// V12HierarchyField schema
const v12HierarchyFieldSchema = z.object({
    data_type: z.string(),
    fields: z.array(v12FieldSchema),
    type: z.string(),
});

// V12PointSizeConfig schema
const v12PointSizeConfigSchema = z.object({
    radius: z.number(),
    minRadius: z.number(),
    maxRadius: z.number(),
});

// V12ColorsConfig schema
const v12ColorsConfigSchema = z.object({
    thresholdsMode: z.string().optional(),
    leftThreshold: z.string().optional(),
    middleThreshold: z.string().optional(),
    rightThreshold: z.string().optional(),
    gradientPalette: z.string().optional(),
    gradientMode: z.string().optional(),
    polygonBorders: z.string().optional(),
    reversed: z.boolean().optional(),
    fieldGuid: z.string().optional(),
    mountedColors: z.record(z.string(), z.string()).optional(),
    coloredByMeasure: z.boolean().optional(),
    palette: z.string().optional(),
    colorMode: colorModeSchema.optional(),
    nullMode: gradientNullModeSchema.optional(),
});

// V12ShapesConfig schema
const v12ShapesConfigSchema = z.object({
    mountedShapes: z.record(z.string(), z.string()).optional(),
    fieldGuid: z.string().optional(),
});

// V12TooltipConfig schema
const v12TooltipConfigSchema = z.object({
    color: z.enum(colorFieldTitleList).optional(),
    fieldTitle: z.enum(colorFieldTitleList).optional(),
});

// V12LayerSettings schema
const v12LayerSettingsSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    alpha: z.number(),
    valid: z.boolean(),
});

// V12CommonPlaceholders schema
const v12CommonPlaceholdersSchema = z.object({
    colors: z.array(v12ColorSchema),
    labels: z.array(v12LabelSchema),
    tooltips: z.array(v12TooltipSchema),
    filters: z.array(v12FilterSchema),
    sort: z.array(v12SortSchema),
    shapes: z.array(v12ShapeSchema).optional(),
    colorsConfig: v12ColorsConfigSchema.optional(),
    geopointsConfig: v12PointSizeConfigSchema.optional(),
    shapesConfig: v12ShapesConfigSchema.optional(),
    tooltipConfig: v12TooltipConfigSchema.optional(),
});

// V12Layer schema
const v12LayerSchema = z.object({
    id: z.string(),
    commonPlaceholders: v12CommonPlaceholdersSchema,
    layerSettings: v12LayerSettingsSchema,
    placeholders: z.array(v12PlaceholderSchema),
});

// V12Visualization schema
const v12VisualizationSchema = z.object({
    id: z.string(),
    highchartsId: z.string().optional(),
    selectedLayerId: z.string().optional(),
    layers: z.array(v12LayerSchema).optional(),
    placeholders: z.array(v12PlaceholderSchema),
});

// V12Update schema
const v12UpdateSchema = z.object({
    action: z.enum(v12UpdateActionsList),
    field: z.any(),
    debug_info: z.string().optional(),
});

// V12ChartsConfigDatasetField schema
const v12ChartsConfigDatasetFieldSchema = z.object({
    guid: z.string(),
    title: z.string(),
    calc_mode: datasetFieldCalcModeSchema.optional(),
});

// Main V12ChartsConfig schema
export const v12ChartsConfigSchema = z.object({
    title: z.string().optional(),
    colors: z.array(v12ColorSchema),
    colorsConfig: v12ColorsConfigSchema.optional(),
    extraSettings: v12CommonSharedExtraSettingsSchema.optional(),
    filters: z.array(v12FilterSchema),
    geopointsConfig: v12PointSizeConfigSchema.optional(),
    hierarchies: z.array(v12HierarchyFieldSchema),
    labels: z.array(v12LabelSchema),
    links: z.array(v12LinkSchema),
    sort: z.array(v12SortSchema),
    tooltips: z.array(v12TooltipSchema),
    tooltipConfig: v12TooltipConfigSchema.optional(),
    type: z.literal(DATALENS_TYPE_LITERAL),
    updates: z.array(v12UpdateSchema),
    visualization: v12VisualizationSchema,
    shapes: z.array(v12ShapeSchema),
    shapesConfig: v12ShapesConfigSchema.optional(),
    version: z.literal(ChartsConfigVersion.V12),
    datasetsIds: z.array(z.string()),
    datasetsPartialFields: z.array(z.array(v12ChartsConfigDatasetFieldSchema)),
    segments: z.array(v12FieldSchema),
    chartType: z.string().optional(),
});

// Export JSON schema generation
export const chartApiValidationJsonSchema = z.toJSONSchema(v12ChartsConfigSchema);

// Export the TypeScript type
export type V12ChartsConfigSchema = z.infer<typeof v12ChartsConfigSchema>;

// Export individual schemas for potential reuse
export {
    v12ColorSchema,
    v12ShapeSchema,
    v12TooltipSchema,
    v12LabelSchema,
    v12FilterSchema,
    v12SortSchema,
    v12LinkSchema,
    v12VisualizationSchema,
    v12UpdateSchema,
    v12FieldSchema,
    v12HierarchyFieldSchema,
    v12PointSizeConfigSchema,
    v12ColorsConfigSchema,
    v12ShapesConfigSchema,
    v12TooltipConfigSchema,
    v12CommonSharedExtraSettingsSchema,
    v12NavigatorSettingsSchema,
    v12FormattingSchema,
    v12ClientOnlyFieldsSchema,
    v12ChartsConfigDatasetFieldSchema,
};
