import {WORKBOOK_STATUS} from 'shared/constants/workbooks';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema/types';
import {Feature} from 'shared/types';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export const getItemParams = (item: CollectionWithPermissions | WorkbookWithPermissions) => {
    const isDisabled =
        isEnabledFeature(Feature.EnableExportWorkbookFile) &&
        'status' in item &&
        (item.status === WORKBOOK_STATUS.CREATING || item.status === WORKBOOK_STATUS.DELETING);

    const status = isDisabled ? item.status : null;

    return {status, isDisabled};
};
