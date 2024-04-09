import type {GetNewConnectionDestination} from 'ui/registry/units/connections/types/getNewConnectionDestination';

import type {GetEntryResponse} from '../../../../shared/schema/types';

export const hasPermissionsToEdit = (permissions: NonNullable<GetEntryResponse['permissions']>) => {
    return permissions.edit || permissions.admin;
};

export const getNewConnectionDestination: GetNewConnectionDestination = () => 'workbook';
