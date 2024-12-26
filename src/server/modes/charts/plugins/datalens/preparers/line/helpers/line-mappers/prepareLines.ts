import isNil from 'lodash/isNil';

import type {
    CommonNumberFormattingOptions,
    DATASET_FIELD_TYPES,
    MarkupItem,
    ServerField,
} from '../../../../../../../../../shared';
import {
    AxisNullsMode,
    getFakeTitleOrTitle,
    isDateField,
    isMarkupField,
    isMeasureName,
    isMeasureValue,
    isPseudoField,
    markupToRawString,
} from '../../../../../../../../../shared';
import type {WrappedHTML} from '../../../../../../../../../shared/types/charts';
import {
    findIndexInOrder,
    getFormatOptionsFromFieldFormatting,
    isNumericalDataType,
} from '../../../../utils/misc-helpers';
import type {LineTemplate} from '../../types';
import {getDateAxisValue} from '../getXAxisValue';
import {getSegmentName} from '../segments/getSegmentName';
import {getY2SegmentNameKey} from '../segments/getSegmentsMap';
import type {RowDataValue} from '../types';

import {mapDataToDimensionColoredLines} from './mapDataToDimensionColoredLines';
import {mapDataToLines} from './mapDataToLines';
import {mapDataToMeasureColoredLines} from './mapDataToMeasureColoredLines';
import type {
    ExtendLineWithSegmentDataArgs,
    GetMappedDataToDimensionColoredLinesArgs,
    GetMappedDataToLinesArgs,
    GetMappedDataToMeasureColoredLinesArgs,
    MappedLinesKeys,
    MergeLabelDataWithLinesArgs,
    PrepareLinesArgs,
} from './types';

const getMappedDataToLines = (args: GetMappedDataToLinesArgs): MappedLinesKeys => {
    return mapDataToLines(args.mapFunctionArguments);
};

const getMappedDataToDimensionColoredLines = (
    args: GetMappedDataToDimensionColoredLinesArgs,
): MappedLinesKeys => {
    let items: ServerField[];
    let isItemsAreEqual = false;

    const {isColorItemExist, isShapeItemExist, colorItem, shapeItem} = args.options;

    if (isColorItemExist && isShapeItemExist && shapeItem) {
        isItemsAreEqual = colorItem.guid === shapeItem.guid;
        items = [colorItem, shapeItem];
    } else if (isShapeItemExist && shapeItem) {
        items = [shapeItem];
    } else {
        items = [colorItem];
    }

    return mapDataToDimensionColoredLines({
        ...args.mapFunctionArguments,
        isItemsAreEqual,
        items,
    });
};

const getMappedDataToMeasureColoredLines = (
    args: GetMappedDataToMeasureColoredLinesArgs,
): MappedLinesKeys => {
    const keys = mapDataToMeasureColoredLines(args.mapFunctionArguments);

    const {colorItem, isSortByMeasureColor, measureColorSortLine} = args.options;

    if (isSortByMeasureColor) {
        measureColorSortLine[getFakeTitleOrTitle(colorItem)].data[keys.lastKey as number | string] =
            {value: keys.colorValue};
    }

    return {
        key: keys.key,
        lastKey: keys.lastKey,
    };
};

const mergeLabelDataWithLines = (args: MergeLabelDataWithLinesArgs) => {
    const {
        labelItem,
        labelsValues,
        yValue,
        hideLabel,
        yItemFormatting,
        yDataType,
        values,
        order,
        keys,
        idToTitle,
        idToDataType,
        lines,
        convertMarkupToString = true,
    } = args;
    const key = keys.key;
    const lastKey = keys.lastKey as string | number;

    if (!labelItem || hideLabel) {
        lines[key].dataLabels = {enabled: false};
        return;
    }

    const labelDataType = idToDataType[labelItem.guid];

    const isMeasureValuesLabel = isMeasureValue(labelItem);

    if (!labelsValues[key]) {
        labelsValues[key] = {};
    }

    let labelValue: RowDataValue;

    if (isMeasureValuesLabel) {
        labelValue = yValue;
    } else {
        const labelItemTitle = idToTitle[labelItem.guid];
        const labelValueIndex = findIndexInOrder(order, labelItem, labelItemTitle);

        labelValue = values[labelValueIndex];
    }

    if (!isNil(labelValue)) {
        if (isNumericalDataType(labelDataType)) {
            labelsValues[key][lastKey] = Number(labelValue);
        } else if (isDateField({data_type: labelDataType})) {
            labelsValues[key][lastKey] = new Date(labelValue);
        } else if (convertMarkupToString && isMarkupField({data_type: labelDataType})) {
            labelsValues[key][lastKey] = markupToRawString(labelValue as unknown as MarkupItem);
        } else {
            labelsValues[key][lastKey] = labelValue;
        }
    }

    const isLabelPseudo = isPseudoField(labelItem);
    const labelFinalDataType = isLabelPseudo ? yDataType : labelDataType;

    let labelFormatting: CommonNumberFormattingOptions | undefined;
    if (isLabelPseudo) {
        labelFormatting = yItemFormatting;
    } else {
        labelFormatting = labelItem.formatting as CommonNumberFormattingOptions | undefined;
    }

    lines[key].dataLabels = getFormatOptionsFromFieldFormatting(
        labelFormatting,
        labelFinalDataType,
    );
};

const extendLineWithSegmentsData = (args: ExtendLineWithSegmentDataArgs): LineTemplate => {
    const {line, segmentNameKey} = args;

    if (line.segmentNameKey) {
        return line;
    }

    return {
        ...line,
        segmentNameKey,
    };
};

function getSeriesId(...str: (string | WrappedHTML)[]) {
    return str.find((s) => typeof s === 'string') ?? '';
}

export const prepareLines = (args: PrepareLinesArgs) => {
    const {
        ySectionItems,
        idToTitle,
        idToDataType,
        order,
        values,
        isMultiDatasets,
        isColorizeByMeasureValue,
        isColorizeByMeasure,
        x2Field,
        colorItem,
        rawX2Value,
        rawXValue,
        x2IsDate,
        isSortByMeasureColor,
        measureColorSortLine,
        isShapeItemExist,
        isColorItemExist,
        isMultiAxis,
        shapeItem,
        xField,
        shapesConfig,
        labelItem,
        isSegmentsExists,
        segmentIndexInOrder,
        layers = [],
        colorMode,
        convertMarkupToString,
    } = args;

    const x2DataType = x2Field ? (idToDataType[x2Field.guid] as DATASET_FIELD_TYPES) : null;

    const rawSegmentName = isSegmentsExists
        ? getSegmentName(values, segmentIndexInOrder)
        : undefined;

    const yFields = ySectionItems.map((ySectionItem) => ySectionItem.field);

    // eslint-disable-next-line complexity
    ySectionItems.forEach((mergedItem) => {
        const {field, lines, labelsValues, nullsSetting, isFirstSection} = mergedItem;
        const yFieldTitle = idToTitle[field.guid] || field.title;

        const segmentNameKey = isFirstSection
            ? rawSegmentName
            : getY2SegmentNameKey(rawSegmentName);

        const actualTitle =
            isMultiDatasets && field.datasetName
                ? `${yFieldTitle} (${field.datasetName})`
                : yFieldTitle;
        const shownTitle = field.fakeTitle || actualTitle;

        const yDataType = (idToDataType[field.guid] || field.data_type) as DATASET_FIELD_TYPES;
        const i = findIndexInOrder(order, field, yFieldTitle);

        let yValue: RowDataValue = values[i];
        const x2Value = isPseudoField(x2Field) || !rawX2Value ? shownTitle : rawX2Value;

        if (isNumericalDataType(yDataType)) {
            if (yValue === null) {
                yValue = nullsSetting === AxisNullsMode.AsZero ? 0 : null;
            } else {
                yValue = Number(yValue);
            }
        } else if (yValue !== null && isDateField({data_type: yDataType})) {
            yValue = getDateAxisValue(yValue, yDataType);
        }

        const yItemFormatting = field.formatting as CommonNumberFormattingOptions | undefined;
        const tooltipOptions = getFormatOptionsFromFieldFormatting(yItemFormatting, yDataType);

        const seriesOptions = {
            tooltip: tooltipOptions,
        };

        let keys: MappedLinesKeys;

        if (isColorizeByMeasureValue || isColorizeByMeasure) {
            keys = getMappedDataToMeasureColoredLines({
                mapFunctionArguments: {
                    x2: x2Field,
                    lines,
                    yValue,
                    isColorizeByMeasureValue,
                    colorItem,
                    order,
                    values,
                    idToTitle,
                    seriesOptions,
                    shownTitle,
                    xValue: rawXValue,
                    x2Value,
                    x2DataType: x2DataType,
                    isX2Date: x2IsDate,
                    segmentName: segmentNameKey,
                },
                options: {
                    colorItem,
                    measureColorSortLine,
                    isSortByMeasureColor,
                },
            });
        } else if (isColorItemExist || isShapeItemExist) {
            keys = getMappedDataToDimensionColoredLines({
                mapFunctionArguments: {
                    idToTitle,
                    values,
                    order,
                    x2: x2Field,
                    x2IsDate,
                    x2Value,
                    xValue: rawXValue,
                    multiaxis: isMultiAxis,
                    shownTitle,
                    lines,
                    seriesOptions,
                    x2DataType,
                    yValue,
                    yItem: field,
                    hasShapes: isShapeItemExist,
                    hasColors: isColorItemExist,
                    segmentName: segmentNameKey,
                    layers,
                    colorMode,
                },
                options: {
                    colorItem,
                    shapeItem,
                    isColorItemExist,
                    isShapeItemExist,
                },
            });
        } else {
            keys = getMappedDataToLines({
                mapFunctionArguments: {
                    x2: x2Field,
                    x2Value,
                    xValue: rawXValue,
                    yValue,
                    lines,
                    yField: field,
                    yFields,
                    idToTitle,
                    seriesOptions,
                    shownTitle,
                    isPseudoColorExist: isPseudoField(colorItem),
                    isPseudoShapeExist: isPseudoField(shapeItem),
                    isColorMeasureNames: colorItem && isMeasureName(colorItem),
                    shapesConfig,
                    x: xField,
                    segmentName: segmentNameKey,
                },
            });
        }

        const hideLabel = field.hideLabelMode === 'hide';

        mergeLabelDataWithLines({
            keys,
            lines,
            labelItem,
            hideLabel,
            labelsValues,
            yValue,
            idToTitle,
            idToDataType,
            order,
            values,
            yDataType,
            yItemFormatting,
            convertMarkupToString,
        });

        const currentLine = lines[keys.key];

        if (segmentNameKey) {
            lines[keys.key] = extendLineWithSegmentsData({
                line: currentLine,
                segmentNameKey,
            });
        }

        lines[keys.key].id = getSeriesId(currentLine.legendTitle, currentLine.title);

        if (keys.pointConflict) {
            lines[keys.key].pointConflict = true;
        }

        lines[keys.key].fieldTitle = getFakeTitleOrTitle(field);
    });
};
