import {Feature} from 'shared';
import type {GetNewConnectionDestination} from 'ui/registry/units/connections/types/getNewConnectionDestination';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {GetEntryResponse} from '../../../../shared/schema/types';

export const hasPermissionsToEdit = (permissions: NonNullable<GetEntryResponse['permissions']>) => {
    return permissions.edit || permissions.admin;
};

export const getNewConnectionDestination: GetNewConnectionDestination = ({
    hasWorkbookIdInParams,
    hasCollectionIdInParams,
}) => {
    if (hasWorkbookIdInParams) {
        return 'workbook';
    } else if (hasCollectionIdInParams && isEnabledFeature(Feature.EnableSharedEntries)) {
        return 'collection';
    } else {
        return 'workbook';
    }
};
