import type {EntryScope} from 'shared';

export type SetEntryKey = ({
    scope,
    type,
    key,
}: {
    scope: EntryScope;
    type: string;
    key: string;
}) => void;
