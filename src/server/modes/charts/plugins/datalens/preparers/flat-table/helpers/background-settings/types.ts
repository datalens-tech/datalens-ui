import {ColorPalette, Palette, ServerField} from '../../../../../../../../../shared';
import {TableFieldBackgroundSettings} from '../../../../../../../../../shared/types/wizard/background-settings';
import {PrepareFunctionDataRow, ResultDataOrder} from '../../../types';

export interface GetFlatTableCellBackgroundSettingsStylesArgs {
    column: ServerField;
    order: ResultDataOrder;
    values: PrepareFunctionDataRow;
    idToTitle: Record<string, string>;
    idToDataType: Record<string, string>;
    currentRowIndex: number;
    backgroundColorsByMeasure: Record<string, (null | number)[]>;
    loadedColorPalettes: Record<string, ColorPalette>;
    availablePalettes: Record<string, Palette>;
}

export interface GetContinuousBackgroundColorStyle {
    currentRowIndex: number;
    backgroundColorsByMeasure: Record<string, (null | number)[]>;
    backgroundSettings: TableFieldBackgroundSettings;
}

export interface GetDiscreteBackgroundColorStyle {
    idToTitle: Record<string, string>;
    idToDataType: Record<string, string>;
    column: ServerField;
    order: ResultDataOrder;
    values: PrepareFunctionDataRow;
    backgroundSettings: TableFieldBackgroundSettings;
    loadedColorPalettes: Record<string, ColorPalette>;
    availablePalettes: Record<string, Palette>;
}

export interface GetBackgroundColorsMapByContinuousColumn {
    columns: ServerField[];
    order: ResultDataOrder;
    data: PrepareFunctionDataRow[];
    idToTitle: Record<string, string>;
    loadedColorPalettes: Record<string, ColorPalette>;
}
