import {WORKBOOK_STATUS} from 'shared/constants/workbooks';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema/types';

export const getItemParams = (item: CollectionWithPermissions | WorkbookWithPermissions) => {
    const hasStatus = 'status' in item;

    const isCreating = hasStatus && item.status === WORKBOOK_STATUS.CREATING;
    const isDeleting = hasStatus && item.status === WORKBOOK_STATUS.DELETING;

    const status = hasStatus ? item.status : null;

    return {status, isCreating, isDeleting};
};
