import type {EntryScope} from 'shared';

export type SharedScope = EntryScope.Dataset | EntryScope.Connection;
export type SharedEntry = {
    scope: string;
    entryId: string;
    //TODO add fullPermissions
};
