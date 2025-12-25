import {WORKBOOK_STATUS} from 'shared/constants/workbooks';
import type {StructureItemWithPermissions} from 'shared/schema/types';
import {Feature} from 'shared/types';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export const getItemParams = (item: StructureItemWithPermissions) => {
    const hasStatus = isEnabledFeature(Feature.EnableExportWorkbookFile) && 'status' in item;

    const isCreating = hasStatus && item.status === WORKBOOK_STATUS.CREATING;
    const isDeleting = hasStatus && item.status === WORKBOOK_STATUS.DELETING;

    const status = hasStatus ? item.status : null;

    return {status, isCreating, isDeleting};
};
