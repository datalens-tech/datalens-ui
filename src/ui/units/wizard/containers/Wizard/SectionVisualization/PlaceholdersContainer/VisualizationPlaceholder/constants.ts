import {PlaceholderId} from 'shared';

export const COLUMNS_PLACEHOLDERS: Record<string, boolean> = {
    [PlaceholderId.FlatTableColumns]: true,
    [PlaceholderId.PivotTableColumns]: true,
};

export const ROWS_PLACEHOLDERS: Record<string, boolean> = {
    [PlaceholderId.PivotTableRows]: true,
};
