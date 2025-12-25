import type {GetEntryResponse} from '../../../shared/schema/types';

export const getFakeEntry = <T extends GetEntryResponse = GetEntryResponse>(
    entryData?: Partial<GetEntryResponse> & {fakeName?: string},
) => {
    return {fake: true, ...(Boolean(entryData) && {...entryData})} as unknown as T;
};
