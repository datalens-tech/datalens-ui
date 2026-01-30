import type {GetEntryResponse, GetSharedEntryResponse} from 'shared/schema';

export const getIsSharedEntry = (
    entry: GetEntryResponse | GetSharedEntryResponse,
): entry is GetSharedEntryResponse => {
    return 'isDelegated' in entry;
};
