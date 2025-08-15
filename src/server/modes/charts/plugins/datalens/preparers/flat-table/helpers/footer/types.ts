import type {ServerField} from '../../../../../../../../../shared';
import type {ChartColorsConfig} from '../../../../types';
import type {PrepareFunctionDataRow, ResultDataOrder} from '../../../types';

export type PrepareFooterValueArgs = {
    column: ServerField;
    params: Pick<GetFooterArgs, 'order' | 'totals' | 'idToTitle' | 'idToDataType'> & {
        columnIndex: number;
        i18n: (label: string, params?: Record<string, string | number>) => string;
    };
};

export type GetFooterCellWithStylesArgs = {
    column: ServerField;
    value: string | number;
    columnValuesByColumn: Record<string, PrepareFunctionDataRow>;
    colorsConfig: ChartColorsConfig;
    defaultColorPaletteId: string;
};

export type GetFooterArgs = {
    columns: ServerField[];
    ChartEditor: any;
    idToTitle: Record<string, string>;
    order: ResultDataOrder;
    totals: (string | null)[];
    columnValuesByColumn: Record<string, PrepareFunctionDataRow>;
    idToDataType: Record<string, string>;
    colorsConfig: ChartColorsConfig;
    defaultColorPaletteId: string;
};
