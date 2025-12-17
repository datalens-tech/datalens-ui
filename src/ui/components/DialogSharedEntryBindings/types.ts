import type {Permissions} from 'shared';
import type {SharedEntryPermissions} from 'shared/schema';

export type SharedEntry = {
    scope: string;
    entryId: string;
    fullPermissions?: SharedEntryPermissions;
    permissions?: Partial<Permissions & SharedEntryPermissions>;
    isDelegated?: boolean;
};
