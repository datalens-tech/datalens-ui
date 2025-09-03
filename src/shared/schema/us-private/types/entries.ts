import type {EntryFieldData, EntryFieldLinks, GetEntryArgs} from '../../us/types';

export interface PrivateGetEntryArgs extends GetEntryArgs {
    branch?: 'published' | 'saved';
}

export interface ProxyCreateEntryArgs {
    workbookId?: string;
    data: EntryFieldData;
    name: string;
    type: string;
    scope: string;
    mode: string;
    links: EntryFieldLinks;
    key?: string;
    includePermissionsInfo?: boolean;
    recursion?: boolean;
    description?: string;
}
