import type {GetEntryResponse} from '../../../../shared/schema/types';

export const hasPermissionsToEdit = (permissions: NonNullable<GetEntryResponse['permissions']>) => {
    return permissions.edit || permissions.admin;
};
