import type {
    ColorMode,
    CommonNumberFormattingOptions,
    DATASET_FIELD_TYPES,
    ServerColor,
    ServerField,
    ServerLabel,
    ServerShape,
    ServerShapesConfig,
    ServerVisualizationLayer,
} from '../../../../../../../../../shared';
import type {PrepareFunctionDataRow, ResultDataOrder} from '../../../types';
import type {LineTemplate, LinesRecord, MergedYSectionItems} from '../../types';
import type {RowDataValue, XAxisValue} from '../types';

export interface PrepareLinesArgs {
    isMultiDatasets: boolean;
    isColorizeByMeasure: boolean;
    isColorizeByMeasureValue: boolean;
    isSortByMeasureColor: boolean;
    isShapeItemExist: boolean;
    isColorItemExist: boolean;
    isSegmentsExists: boolean;
    x2IsDate: boolean;
    colorItem: ServerColor;
    shapeItem?: ServerShape;
    idToTitle: Record<string, string>;
    idToDataType: Record<string, string>;
    order: ResultDataOrder;
    values: PrepareFunctionDataRow;
    x2Field: ServerField | undefined;
    xField: ServerField | undefined;
    rawX2Value: XAxisValue;
    rawXValue: XAxisValue;
    isMultiAxis: boolean;
    labelItem: ServerLabel;
    measureColorSortLine: Record<string, Record<'data', LineTemplate['data']>>;
    shapesConfig: ServerShapesConfig | undefined;
    ySectionItems: MergedYSectionItems[];
    segmentIndexInOrder: number;
    layers?: ServerVisualizationLayer[];
    colorMode?: ColorMode;
    convertMarkupToString?: boolean;
}

export interface GetMappedDataToLinesArgs {
    mapFunctionArguments: MapDataToLinesArgs;
}

export interface GetMappedDataToDimensionColoredLinesArgs {
    mapFunctionArguments: Omit<MapDataToDimensionColoredLinesArgs, 'isItemsAreEqual' | 'items'>;
    options: {
        isColorItemExist: boolean;
        isShapeItemExist: boolean;
        colorItem: ServerColor;
        shapeItem: ServerShape | undefined;
    };
}

export interface GetMappedDataToMeasureColoredLinesArgs {
    mapFunctionArguments: MapDataToMeasureColoredLinesArgs;
    options: {
        colorItem: ServerColor;
        isSortByMeasureColor: boolean;
        measureColorSortLine: Record<string, Record<'data', LineTemplate['data']>>;
    };
}

export interface CommonMapDataToLinesArgs {
    segmentName: string | undefined | null;
    xValue: string | number | Date | undefined | null;
    shownTitle: string;
    x2: ServerField | undefined;
    x2Value: string | number | Date;
    lines: LinesRecord;
    yValue: string | number | undefined | null;
    seriesOptions: any;
    layers?: ServerVisualizationLayer[];
}

export interface MapDataToLinesArgs extends CommonMapDataToLinesArgs {
    x?: ServerField;
    yField: ServerField;
    idToTitle: Record<string, string>;
    isColorMeasureNames: boolean;
    isPseudoColorExist: boolean;
    isPseudoShapeExist: boolean;
    shapesConfig: ServerShapesConfig | undefined;
    yFields: ServerField[];
}

export interface MapDataToDimensionColoredLinesArgs extends CommonMapDataToLinesArgs {
    items: ServerColor[];
    idToTitle: Record<string, string>;
    values: Array<string | number | null>;
    order: ResultDataOrder;
    multiaxis: boolean;
    isMultiLineWithShape: boolean;
    x2IsDate: boolean;
    x2DataType: DATASET_FIELD_TYPES | null;
    yItem: ServerField;
    hasColors: boolean;
    hasShapes: boolean;
    isItemsAreEqual: boolean;
    colorMode?: ColorMode;
}

export interface MapDataToMeasureColoredLinesArgs extends CommonMapDataToLinesArgs {
    colorItem: ServerField;
    order: ResultDataOrder;
    idToTitle: Record<string, string>;
    values: Array<string | number | null>;
    isColorizeByMeasureValue: boolean;
    x2DataType: DATASET_FIELD_TYPES | null;
    isX2Date: boolean;
}

export interface GetColorValueFromColorFieldArgs {
    colorItem: ServerField;
    values: Array<string | number | null>;
    idToTitle: Record<string, string>;
    order: ResultDataOrder;
}

export interface GetFieldTitleForValueArgs {
    yItem: ServerField;
    hasField: boolean;
    defaultValue: string;
}

export interface GetColorAndShapeValuesArgs {
    yItem: ServerField;
    formattedValue: string;
    combinedValue?: string;
}

export interface MergeLabelDataWithLinesArgs {
    keys: MappedLinesKeys;
    lines: LinesRecord;
    labelItem: ServerLabel;
    hideLabel: boolean;
    labelsValues: Record<string, Record<string, any>>;
    yValue: RowDataValue;
    idToTitle: Record<string, string>;
    idToDataType: Record<string, string>;
    order: ResultDataOrder;
    values: PrepareFunctionDataRow;
    yDataType: DATASET_FIELD_TYPES;
    yItemFormatting: CommonNumberFormattingOptions | undefined;
    convertMarkupToString?: boolean;
}

export interface ExtendLineWithSegmentDataArgs {
    line: LineTemplate;
    segmentNameKey: string;
}

export type ColorAndShapesValues = {colorValue?: string; shapeValue?: string};

export type MappedLinesKeys = {
    key: string;
    lastKey: string | number | Date | null;
    pointConflict?: boolean;
};
