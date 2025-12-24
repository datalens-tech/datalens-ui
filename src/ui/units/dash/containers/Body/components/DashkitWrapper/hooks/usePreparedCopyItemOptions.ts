import React from 'react';

import type {PreparedCopyItemOptions} from '@gravity-ui/dashkit';
import {useSelector} from 'react-redux';

import {getPreparedCopyItemOptions} from '../../../../../modules/helpers';
import type {CopiedConfigContext} from '../../../../../modules/helpers';
import {
    selectCurrentTab,
    selectCurrentTabId,
    selectDashEntry,
    selectDashWorkbookId,
    selectEntryId,
} from '../../../../../store/selectors/dashTypedSelectors';

export type GetPreparedCopyItemOptions<T extends object = {}> = (
    itemToCopy: PreparedCopyItemOptions<T>,
) => PreparedCopyItemOptions<T>;

export const usePreparedCopyItemOptions = (): {
    getPreparedCopyItemOptionsFn: GetPreparedCopyItemOptions<any>;
} => {
    const workbookId = useSelector(selectDashWorkbookId);
    const tabId = useSelector(selectCurrentTabId);
    const tabData = useSelector(selectCurrentTab);
    const entryId = useSelector(selectEntryId);
    const entry = useSelector(selectDashEntry);

    const getPreparedCopyItemOptionsFn = React.useCallback(
        (itemToCopy: PreparedCopyItemOptions<CopiedConfigContext>) => {
            return getPreparedCopyItemOptions(itemToCopy, tabData, {
                workbookId: workbookId ?? null,
                fromScope: entry.scope,
                targetEntryId: entryId,
                targetDashTabId: tabId,
            });
        },
        [entryId, entry.scope, tabId, tabData, workbookId],
    );

    return {getPreparedCopyItemOptionsFn};
};
