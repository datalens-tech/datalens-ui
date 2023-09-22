import type {GetEntryResponse} from '../../../shared/schema/types';

export const getFakeEntry = (entryData?: Partial<GetEntryResponse> & {fakeName?: string}) => {
    return {fake: true, ...(Boolean(entryData) && {...entryData})} as GetEntryResponse;
};
