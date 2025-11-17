import isNil from 'lodash/isNil';

import {
    GradientNullModes,
    type ServerField,
    type TableFieldBackgroundSettings,
} from '../../../../../../../../../shared';
import type {ChartColorsConfig} from '../../../../types';
import {colorizeByColorValues} from '../../../../utils/color-helpers';
import {
    findIndexInOrder,
    isTableFieldBackgroundSettingsEnabled,
} from '../../../../utils/misc-helpers';
import {getCurrentBackgroundGradient} from '../../../helpers/backgroundSettings/misc';
import type {PrepareFunctionDataRow} from '../../../types';

import type {GetBackgroundColorsMapByContinuousColumn} from './types';

export function colorizeFlatTableColumn({
    data,
    colorsConfig,
    index,
}: {
    data: PrepareFunctionDataRow[];
    index: number;
    colorsConfig: ChartColorsConfig;
}) {
    const nilValue = colorsConfig.nullMode === GradientNullModes.AsZero ? 0 : null;
    const colorValues = data.reduce<(number | null)[]>((acc, row) => {
        const rowValue = row[index];
        const parsedRowValue = isNil(rowValue) ? nilValue : parseFloat(rowValue);
        acc.push(parsedRowValue);
        return acc;
    }, []);

    return colorizeByColorValues({colorValues, colorsConfig});
}

export const getBackgroundColorsMapByContinuousColumn = (
    args: GetBackgroundColorsMapByContinuousColumn,
) => {
    const {columns, idToTitle, order, data, chartColorsConfig} = args;

    const columnsWithBackgroundSettings = columns.filter(
        (column): column is ServerField & {backgroundSettings: TableFieldBackgroundSettings} =>
            isTableFieldBackgroundSettingsEnabled(column),
    );

    const measuresWhichUsedForColorizing = columnsWithBackgroundSettings.filter(
        (column) => column.backgroundSettings.settings.isContinuous,
    );

    return measuresWhichUsedForColorizing.reduce(
        (acc, column) => {
            const backgroundColors = column.backgroundSettings;
            const guid = backgroundColors.colorFieldGuid;
            const gradientState = backgroundColors.settings.gradientState;

            const colorsConfig: ChartColorsConfig = {
                ...gradientState,
                colors: [],
                loadedColorPalettes: {},
                availablePalettes: chartColorsConfig.availablePalettes,
                gradientColors:
                    getCurrentBackgroundGradient(
                        gradientState,
                        chartColorsConfig.loadedColorPalettes,
                    )?.colors || [],
            };

            const title = idToTitle[guid];
            const index = findIndexInOrder(order, column, title);

            const rgbColorValues = colorizeFlatTableColumn({
                colorsConfig: colorsConfig,
                index,
                data,
            });
            return {
                ...acc,
                [backgroundColors.settingsId]: rgbColorValues,
            };
        },
        {} as Record<string, any>,
    );
};
