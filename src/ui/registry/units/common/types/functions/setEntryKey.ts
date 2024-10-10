import type {EntryScope} from 'shared';

export type SetEntryKey = ({
    scope,
    type,
    key,
    withRouting,
}: {
    scope: EntryScope;
    type: string;
    key: string;
    withRouting?: boolean;
}) => void;
