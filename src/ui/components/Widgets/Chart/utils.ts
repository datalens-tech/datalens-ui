import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

import type {StringParams} from '../../../../shared';

export function cleanUpConflictingParameters(args: {
    prev: StringParams | undefined | null;
    current: StringParams | undefined;
}) {
    const {prev, current} = args;

    // When changing the parameters, the data in the table may also change,
    // and the sorting by rows (linked to the data) becomes incorrect.
    // Therefore, reset the sorting if there are parameters that potentially affect data
    const tableRowSortKey = '_sortRowMeta';
    if (prev && current && tableRowSortKey in current) {
        if (!isEqual(omit(prev, tableRowSortKey), omit(prev, current))) {
            delete current[tableRowSortKey];
        }
    }
}
