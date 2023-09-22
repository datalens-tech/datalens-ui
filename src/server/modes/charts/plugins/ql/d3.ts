import {QLEntryDataShared} from '../../../../../shared';
import {buildD3Config as buildD3CommonConfig} from '../datalens/d3';

export function buildD3Config({shared}: {shared: QLEntryDataShared}) {
    return buildD3CommonConfig(shared);
}
