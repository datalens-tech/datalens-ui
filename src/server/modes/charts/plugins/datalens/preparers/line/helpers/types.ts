import type {
    ServerColor,
    ServerField,
    ServerSort,
    WizardVisualizationId,
} from '../../../../../../../../shared';
import type {Categories, ResultDataOrder} from '../../types';
import type {LineTemplate, LinesRecord} from '../types';

export interface GetXAxisValueArgs {
    categories: (number | string)[];
    ys1: ServerField[];
    values: Array<string | null | Date | number>;
    x: ServerField;
    idToTitle: Record<string, string>;
    order: ResultDataOrder;
    xIsDate: boolean;
    xIsNumber: boolean;
    xDataType: string;
    xIsPseudo: boolean;
    categoriesMap?: Map<string | number, boolean>;
}

export interface GetSortedCategoriesArgs {
    categories: Categories;
    sortItem: ServerSort;
    colorItem: ServerColor | undefined;
    ySectionItems: ServerField[];
    lines: LinesRecord[];
    isSortAvailable: boolean;
    isSortWithYSectionItem: boolean;
    isXNumber: boolean;
    isSegmentsExists: boolean;
    isSortBySegments: boolean;
    measureColorSortLine: Record<string, Record<'data', LineTemplate['data']>>;
}

export interface SortCategoriesWithYSectionArgs
    extends Pick<
        GetSortedCategoriesArgs,
        'ySectionItems' | 'categories' | 'sortItem' | 'colorItem' | 'isSegmentsExists'
    > {
    lines: LinesRecord;
    lineKeys: string[];
}

export interface SortCategoriesWithColorsSection
    extends Pick<GetSortedCategoriesArgs, 'sortItem' | 'measureColorSortLine' | 'categories'> {
    colorItem: ServerColor;
}

export type RowDataValue = string | number | Date | null;

export type XAxisValue = RowDataValue | undefined;

export type GetItemValuesOptions = {
    idToTitle: Record<string, string>;
    order: ResultDataOrder;
    values: (string | number | null)[];
};

export type GetSortedLineKeysArgs = {
    isSortAvailable: boolean;
    isSortBySegments: boolean;
    sortItem: ServerSort;
    colorItem: ServerColor;
    lines: LinesRecord[];
    visualizationId: WizardVisualizationId;
    yField: ServerField;
    categories: Categories;
};

export interface GetLineKeyArgs {
    value: string | undefined;
    x2AxisValue: string | number | Date;
    isX2Axis: boolean;
    isMultiAxis: boolean;
    isMultiLineWithShape?: boolean;
    shownTitle: string;
    segmentName: string | undefined | null;
}

export type ItemValues = {
    value: string | number | null;
    formattedValue: string | number;
    extraValue?: string;
};
