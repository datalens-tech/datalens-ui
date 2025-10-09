import {WORKBOOK_STATUS} from 'shared/constants/workbooks';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema/types';
import {Feature} from 'shared/types';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export const getItemParams = (item: CollectionWithPermissions | WorkbookWithPermissions) => {
    const hasStatus = isEnabledFeature(Feature.EnableExportWorkbookFile) && 'status' in item;

    const isCreating = hasStatus && item.status === WORKBOOK_STATUS.CREATING;
    const isDeleting = hasStatus && item.status === WORKBOOK_STATUS.DELETING;

    const status = hasStatus ? item.status : null;

    return {status, isCreating, isDeleting};
};
