import {
    ApiV2Annotations,
    ColorPalette,
    FieldGuid,
    PseudoFieldTitle,
    ServerField,
    TableFieldBackgroundSettings,
    getFakeTitleOrTitle,
} from '../../../../../../../../shared';
import {selectServerPalette} from '../../../../../../../constants';
import {ChartColorsConfig} from '../../../js/helpers/colors';
import {colorizePivotTableCell} from '../../../utils/color-helpers';
import {getColor} from '../../../utils/constants';
import {getCurrentBackgroundGradient} from '../../helpers/backgroundSettings/misc';
import {
    AnnotationsMap,
    CellValue,
    ChartkitCell,
    ChartkitHeadCell,
    PivotDataRows,
    PivotField,
    PivotTableFieldSettings,
} from '../types';

import {getAnnotation, getDatasetFieldFromPivotTableValue, parsePivotTableCellId} from './misc';

const getContinuousColorValue = (colorValue: undefined | null | string | number): number | null => {
    if (
        colorValue === undefined ||
        colorValue === null ||
        colorValue === '' ||
        isNaN(Number(colorValue))
    ) {
        return null;
    }

    return Number(colorValue);
};

const getDiscreteColorValue = (
    colorValue: undefined | null | string,
    settings: TableFieldBackgroundSettings['settings'],
    loadedColorPalettes: Record<string, ColorPalette>,
): string | null => {
    const mountedColors = settings.paletteState.mountedColors;
    const palette = settings.paletteState.palette;

    if (!mountedColors || !palette || !colorValue) {
        return null;
    }

    const colorIndex = mountedColors[colorValue];

    if (!colorIndex) {
        return null;
    }

    return getColor(Number(colorIndex), selectServerPalette(palette, loadedColorPalettes));
};

type ColorizePivotTableHeaderByBackgroundSettings = {
    cell: ChartkitCell | ChartkitHeadCell;
    backgroundSettings: TableFieldBackgroundSettings | undefined;
    cellValue: string;
    parents: Record<string, boolean>;
    isTotal: boolean;
    loadedColorPalettes: Record<string, ColorPalette>;
};
export const colorizePivotTableHeaderByBackgroundSettings = ({
    backgroundSettings,
    cell,
    cellValue,
    parents,
    isTotal,
    loadedColorPalettes,
}: ColorizePivotTableHeaderByBackgroundSettings) => {
    if (isTotal) {
        return {};
    }
    if (
        backgroundSettings &&
        backgroundSettings.enabled &&
        backgroundSettings.settings.paletteState
    ) {
        let colorValue = getDiscreteColorValue(
            cellValue,
            backgroundSettings.settings,
            loadedColorPalettes,
        );

        if (!colorValue) {
            const parentNames = Object.keys(parents);
            parentNames.forEach((parentName) => {
                if (colorValue) {
                    return;
                }

                colorValue = getDiscreteColorValue(
                    parentName,
                    backgroundSettings.settings,
                    loadedColorPalettes,
                );
            });
        }

        if (colorValue) {
            return {
                ...cell.css,
                backgroundColor: colorValue,
                color: '#FFF',
            };
        }
    }

    return {};
};

type PrepareBackgroundColorSettings = {
    rowsData: PivotDataRows[];
    annotationsMap: AnnotationsMap;
    fieldsItemIdMap: Record<number, PivotField>;
    fieldDict: Record<string, ServerField>;
    settingsByField: Record<string, PivotTableFieldSettings>;
    loadedColorPalettes: Record<string, ColorPalette>;
};

export const prepareBackgroundColorSettings = (args: PrepareBackgroundColorSettings) => {
    const {annotationsMap, rowsData, fieldsItemIdMap, fieldDict, settingsByField} = args;

    if (!rowsData.length) {
        return {discreteColorsByField: {}, continuousColorsByField: {}};
    }

    const colorValuesByField: Record<FieldGuid, Set<null | number | string>> = {};
    const discreteColorsByField: Record<FieldGuid, Record<CellValue, string | null>> = {};
    const continuousColorsByField: Record<FieldGuid, Record<CellValue, string | null>> = {};

    rowsData.forEach((row) => {
        row.values.forEach((cellValues) => {
            if (!cellValues) {
                return;
            }

            const datasetField = getDatasetFieldFromPivotTableValue(
                cellValues,
                fieldsItemIdMap,
                fieldDict,
            );

            const backgroundSettings =
                settingsByField[datasetField?.guid || '']?.backgroundSettings;

            if (!datasetField || !backgroundSettings) {
                return;
            }

            const backgroundColorAnnotation = getAnnotation(
                cellValues,
                annotationsMap,
                ApiV2Annotations.BackgroundColor,
            );

            if (!backgroundColorAnnotation) {
                return;
            }

            const [colorValue] = backgroundColorAnnotation;
            const {settings, colorFieldGuid} = backgroundSettings;

            if (settings.isContinuous) {
                if (!colorValuesByField[colorFieldGuid]) {
                    colorValuesByField[colorFieldGuid] = new Set();
                }

                colorValuesByField[colorFieldGuid].add(colorValue);
                return;
            }

            if (!discreteColorsByField[datasetField.guid]) {
                discreteColorsByField[datasetField.guid] = {};
            }

            discreteColorsByField[datasetField.guid][colorValue] = getDiscreteColorValue(
                colorValue,
                settings,
                args.loadedColorPalettes,
            );
        });
    });

    const fieldSettings = Object.values(settingsByField);
    Array.from(fieldSettings).forEach((fieldSetting) => {
        const backgroundSettings = fieldSetting.backgroundSettings;
        if (!backgroundSettings?.settings.isContinuous) {
            return;
        }

        const guid = backgroundSettings.colorFieldGuid;

        const colorValues = colorValuesByField[guid];

        if (!colorValues) {
            return;
        }

        const fieldColorValues = Array.from(colorValues);

        continuousColorsByField[guid] = {};

        const colorValuesWithoutNull = fieldColorValues.filter((cv): cv is number => cv !== null);

        const min = Math.min(...colorValuesWithoutNull);
        const max = Math.max(...colorValuesWithoutNull);

        const chartColorsConfig: ChartColorsConfig = {
            ...backgroundSettings.settings.gradientState,
            colors: [],
            loadedColorPalettes: args.loadedColorPalettes,
            gradientColors: getCurrentBackgroundGradient(
                backgroundSettings.settings.gradientState,
                args.loadedColorPalettes,
            ).colors,
        };

        fieldColorValues.forEach((value) => {
            const colorValue = getContinuousColorValue(value);
            if (colorValue === null) {
                return;
            }

            const color = colorizePivotTableCell(colorValue, chartColorsConfig, [min, max]);
            continuousColorsByField[guid][String(value)] = color.backgroundColor;
        });
    });

    return {continuousColorsByField, discreteColorsByField};
};

type ColorizePivotTableByFieldBackgroundSettings = {
    rows: any[];
    annotationsMap: AnnotationsMap;
    settingsByField: Record<string, PivotTableFieldSettings>;
    rowHeaderLength: number;

    rowsData: PivotDataRows[];
    fieldsItemIdMap: Record<string, PivotField>;
    fieldDict: Record<string, ServerField>;
    loadedColorPalettes: Record<string, ColorPalette>;
};

export const colorizePivotTableByFieldBackgroundSettings = (
    args: ColorizePivotTableByFieldBackgroundSettings,
) => {
    const {
        settingsByField,
        rows,
        annotationsMap,
        rowHeaderLength,
        rowsData,
        fieldDict,
        fieldsItemIdMap,
        loadedColorPalettes,
    } = args;

    const {discreteColorsByField, continuousColorsByField} = prepareBackgroundColorSettings({
        rowsData,
        fieldDict,
        fieldsItemIdMap,
        annotationsMap,
        settingsByField,
        loadedColorPalettes,
    });

    rows.forEach((row) => {
        for (let i = rowHeaderLength; i < row.cells.length; i++) {
            const cell: ChartkitCell = row.cells[i];
            if (!cell.id || cell.isTotalCell) {
                continue;
            }

            const fieldGuid = parsePivotTableCellId(cell.id).guid;
            const backgroundColorSettings = settingsByField[fieldGuid]?.backgroundSettings;

            if (!backgroundColorSettings) {
                continue;
            }

            const {settings, colorFieldGuid} = backgroundColorSettings;
            const colorKey = cell.colorKey;

            if (!colorKey) {
                continue;
            }

            const datasetField = fieldDict[fieldGuid];

            let backgroundColor: string | undefined | null;
            if (settings.isContinuous && continuousColorsByField[colorFieldGuid]) {
                const continuousColorsByCellValue = continuousColorsByField[colorFieldGuid];
                backgroundColor = continuousColorsByCellValue[String(colorKey)];
            } else if (settings.paletteState && discreteColorsByField[fieldGuid]) {
                const discreteColorsByCellValue = discreteColorsByField[fieldGuid];
                backgroundColor = discreteColorsByCellValue[String(colorKey)];
            } else if (
                // TODO: CHARTS-7124
                // Now the backend fail with 500 when the helmet is in the measure names annotations.
                // Therefore, we made the coloring on our own. After backend corrects,
                // you will need to switch to a general approach and remove if here
                backgroundColorSettings.colorFieldGuid === PseudoFieldTitle.MeasureNames &&
                datasetField
            ) {
                const measureName = getFakeTitleOrTitle(datasetField);
                backgroundColor = getDiscreteColorValue(measureName, settings, loadedColorPalettes);
            }

            if (backgroundColor) {
                cell.css = {
                    ...cell.css,
                    color: '#FFF',
                    backgroundColor,
                };
            }
        }
    });
};
