import Utils from '../../utils';

import type {EntryData} from './types';

export const getEntryName = (entry: EntryData) => {
    return Utils.getEntryNameFromKey(entry.key, true);
};
