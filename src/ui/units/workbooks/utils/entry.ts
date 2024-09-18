import {DL} from '../../../constants';
import type {CheckWbCreateEntryButtonVisibility} from '../../../registry/units/workbooks/types/functions/checkWbCreateEntryButtonVisibility';

export const checkWbCreateEntryButtonVisibility: CheckWbCreateEntryButtonVisibility = (
    workbook,
) => {
    return workbook.permissions.update && !DL.IS_MOBILE;
};
